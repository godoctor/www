all:
	godoctor -doc man >godoctor.1
	groff -t -mandoc -Thtml godoctor.1 >godoctor.1.html
	godoctor -doc vim >godoctor-vim.txt
	vim -f +"syn on" +"run! syntax/2html.vim" +"wq" +"q" godoctor-vim.txt

clean:
	rm -f godoctor.1 godoctor.1.html godoctor-vim.txt godoctor-vim.txt.html
