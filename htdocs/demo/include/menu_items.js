// items structure
// each item is the array of one or more properties:
// [text, link, settings, subitems ...]
// use the builder to export errors free structure if you experience problems with the syntax

var MENU_ITEMS = [
	['File', null, null,
		['New', 'javascript:onClickNew();'],
		['Open Example...', 'javascript:onClickOpenExample();'],
		['About...', 'javascript:onClickAbout();']
	],
	['Edit', null, null,
		['Undo', 'javascript:editor.undo();'],
		['Redo', 'javascript:editor.redo();']
	]
	// Refactor menu added dynamically by godoctor.js
];
