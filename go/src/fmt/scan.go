// Copyright 2010 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package fmt

type ScanState interface {
	ReadRune() (r rune, size int, err error)
	UnreadRune() error
	SkipSpace()
	Token(skipSpace bool, f func(rune) bool) (token []byte, err error)
	Width() (wid int, ok bool)
	Read(buf []byte) (n int, err error)
}

type Scanner interface {
	Scan(state ScanState, verb rune) error
}

func Scan(a ...interface{}) (n int, err error) {
	return
}

func Scanln(a ...interface{}) (n int, err error) {
	return
}

func Scanf(format string, a ...interface{}) (n int, err error) {
	return
}

func Sscan(str string, a ...interface{}) (n int, err error) {
	return
}

func Sscanln(str string, a ...interface{}) (n int, err error) {
	return
}

func Sscanf(str string, format string, a ...interface{}) (n int, err error) {
	return
}

//func Fscan(r io.Reader, a ...interface{}) (n int, err error) {
//	return
//}
//
//func Fscanln(r io.Reader, a ...interface{}) (n int, err error) {
//	return
//}
//
//func Fscanf(r io.Reader, format string, a ...interface{}) (n int, err error) {
//	return
//}
