// Copyright 2015 Auburn University. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// +build appengine

package main

import (
	"bytes"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/godoctor/godoctor/doc"
	"github.com/godoctor/godoctor/engine/cli"
	"github.com/godoctor/godoctor/engine/protocol"
)

const ABOUT = "Go Doctor 0.4 (Beta)"

const HTDOCS_DIR = "htdocs"

const MAN_PAGE_HTML = "generated/godoctor.1.html"

const VIMDOC_HTML = "generated/godoctor-vim.txt.html"

const INSTALL_HTML_TEMPLATE = "htdocs/install.html"

const DOC_HTML_TEMPLATE = "htdocs/doc.html"

const EXAMPLES_DIR = "htdocs/demo/examples"

// Strings that can be substituted into doc.html
type userGuide struct {
	TOC     string
	Content string
}

// Cached contents of doc.html or install.html after substitution
// (see cacheDocHTML and cacheInstallHTML)
var cachedHTML struct {
	docContent     string
	installContent string
	err            error
}

func init() {
	// Set the GOPATH to prevent Go Doctor warnings
	os.Setenv("GOPATH", os.TempDir())

	// Point the Go Doctor to a local copy of the Go standard library
	// since $GOROOT is not readable on Google's App Engine servers
	cwd, err := os.Getwd()
	if err == nil {
		os.Setenv("GOROOT", filepath.Join(cwd, "go"))
	}

	cacheDocHTML()
	cacheInstallHTML()
	http.HandleFunc("/exe/goenv", goenv)
	http.HandleFunc("/exe/ls", ls)
	http.HandleFunc("/exe/godoctor", godoctor)
	http.HandleFunc("/doc.html", docHTML)
	http.HandleFunc("/install.html", installHTML)
	http.Handle("/", http.FileServer(http.Dir(HTDOCS_DIR)))
}

// cacheInstallHTML embeds the Installation Guide into the htdocs/install.html
// template and then saves the result in memory.  This avoids file I/O on every
// HTTP request.
func cacheInstallHTML() {
	installBytes, err := ioutil.ReadFile(INSTALL_HTML_TEMPLATE)
	if err != nil {
		cachedHTML.err = err
		return
	}

	var b bytes.Buffer
	doc.PrintInstallGuide(ABOUT, cli.Flags().FlagSet, &b)
	userGuide := extractFrom(b.String())

	t := template.Must(template.New("install").Parse(string(installBytes)))
	var result bytes.Buffer
	err = t.Execute(&result, userGuide)
	if err != nil {
		cachedHTML.err = err
		return
	}

	cachedHTML.installContent = result.String()
}

// cacheDocHTML embeds the User's Guide into the htdocs/doc.html template and
// then saves the result in memory.  This avoids file I/O (and running groff,
// etc.) on every HTTP request.
func cacheDocHTML() {
	docBytes, err := ioutil.ReadFile(DOC_HTML_TEMPLATE)
	if err != nil {
		cachedHTML.err = err
		return
	}

	manBytes, err := ioutil.ReadFile(MAN_PAGE_HTML)
	if err != nil {
		cachedHTML.err = err
		return
	}

	vimBytes, err := ioutil.ReadFile(VIMDOC_HTML)
	if err != nil {
		cachedHTML.err = err
		return
	}

	var b bytes.Buffer
	ctnt := doc.UserGuideContent{}
	ctnt.ManPageHTML = extractBetween(string(manBytes), "<body>", "</body>")
	ctnt.VimdocHTML = extractBetween(string(vimBytes), "<body>", "</body>")
	doc.PrintUserGuideAsGiven(ABOUT, cli.Flags().FlagSet, &ctnt, &b)
	userGuide := extractFrom(b.String())

	t := template.Must(template.New("doc").Parse(string(docBytes)))
	var result bytes.Buffer
	err = t.Execute(&result, userGuide)
	if err != nil {
		cachedHTML.err = err
		return
	}

	cachedHTML.docContent = result.String()
}

func extractFrom(html string) userGuide {
	toc := extractBetween(html, "<!-- BEGIN TOC -->", "<!-- END TOC -->")
	ctnt := extractBetween(html, "<!-- BEGIN CONTENT -->", "<!-- END CONTENT -->")
	return userGuide{toc, ctnt}
}

func extractBetween(s, from, to string) string {
	i := strings.Index(s, from)
	if i < 0 {
		return ""
	}

	j := strings.LastIndex(s, to)
	if j < 0 {
		return ""
	}

	return s[i+len(from) : j]
}

// goenv displays the GOPATH environment variable
func goenv(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	fmt.Fprintln(w, os.Getenv("GOPATH"))
	fmt.Fprintln(w, os.Getenv("GOROOT"))
}

// ls lists the example files, one per line.
func ls(w http.ResponseWriter, r *http.Request) {
	fileInfos, err := ioutil.ReadDir(EXAMPLES_DIR)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "text/plain")
	for _, fi := range fileInfos {
		if !fi.IsDir() && filepath.Ext(fi.Name()) == ".go" {
			fmt.Fprintln(w, fi.Name())
		}
	}
}

// godoctor receives a POST request whose body is in the OpenRefactory JSON
// protocol format and returns a reply.
func godoctor(w http.ResponseWriter, r *http.Request) {
	json, err := drainBody(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	protocol.Run(w, ABOUT, []string{json})
}

// Based on http://golang.org/src/net/http/httputil/dump.go?s=5197:5268#L21
func drainBody(b io.ReadCloser) (string, error) {
	var buf bytes.Buffer
	if _, err := buf.ReadFrom(b); err != nil {
		return "", err
	}
	if err := b.Close(); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// docHTML embeds the User's Guide into the htdocs/doc.html template.
func docHTML(w http.ResponseWriter, r *http.Request) {
	if cachedHTML.err != nil {
		http.Error(w, cachedHTML.err.Error(),
			http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintln(w, cachedHTML.docContent)
}

// installHTML embeds the Installation Guide into the htdocss/install.html
// template.
func installHTML(w http.ResponseWriter, r *http.Request) {
	if cachedHTML.err != nil {
		http.Error(w, cachedHTML.err.Error(),
			http.StatusInternalServerError)
	}
	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintln(w, cachedHTML.installContent)
}
