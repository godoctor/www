/*
    godoctor.js - Functions for interfacing with the Go Doctor online demo

    Authors: Robert Horn and Jeff Overbey
    Date: September 2013 (OpenRefactory), July-August 2014 (Go Doctor)

    The following variables must be externally defined:
        GODOCTOR_VERSION
        EDITOR_VERSION
        MENU_VERSION
        JQUERY_VERSION
*/

/*
    Clears the editor, allowing the user to write a program from scratch
*/
function onClickNew() {
  if (confirm('This will clear the contents of the editor.  Are you sure?')) {
    editor.setValue('');
  }
}

/*
    Displays a list of example programs
*/
function onClickOpenExample() {
    showLoading();
    $.ajax({
        url: '/exe/ls',
        type: 'GET',
        async: true,
        data: "",
        dataType: "text",
        success: function(data) {
            var files = data.split("\n");
            var html = '<p>Select a file:&nbsp; \n';
            html += '<select id="filename" onChange="onChangeFilename()">\n';
            for (var i = 0; i < files.length; i++) {
                var filename = files[i];
                var name = filename.replace(/\.go\.txt$/, '');
                if (filename != "") {
                    html += '  <option value="'+filename+'">'+name+'</option>\n';
                }
            }
            html += '</select>';
            html += '<button onClick="onChangeFilename()">Load</button>';
            html += '</p>';
            $('#rightSide').html(html);
        },
        error: function() {
            alert("An error occurred while retrieving a list of examples.");
        }
    });
}

/*
    Resets the editor cursor to line 1, clearing the selection
*/
function resetCursor() {
  editor.gotoLine(0);
}

/*
    Populates the editor with the contents of example file whose name was
    selected in the filename combobox (created by onClickOpenExample)
*/
function onChangeFilename() {
    var filename = $('#filename option:selected').val();
    if (filename != "") {
        openExample(filename);
    }
}

/*
    Populates the editor with the contents of the given example file
*/
function openExample(filename) {
    $.ajax({
        url: '/demo/examples/' + filename,
        type: 'GET',
        async: true,
        data: "",
        dataType: "text",
        success: function(data) {
      editor.setValue(data);
      resetCursor();
      showDescription();
        },
        error: function() {
            alert("An error occurred attempting to load " + filename + ".");
        }
    });
}

/*
    Displays an instructional/welcome message below the editor
*/
function showDescription() {
    html = '<p class="description">Type a Go program above, or click <b>File '+
           '&gt; Open Example</b>. Then click <b>Refactor</b>.'+
           '<br/><br/>'+
           'Note: Only the "fmt", "math", and "math/rand" packages are '+
           'available in this Web demonstration (the full Go Doctor tool '+
           'does not have this limitation).</p>';
    $('#rightSide').html(html);
}

/*
    Displays an instructional/welcome message below the editor
*/
function showLoading() {
    html = '<p class="description">Loading; please wait...</p>';
    $('#rightSide').html(html);
}


/*
    Retrieves the version number from the server and prints information about
    JavaScript libraries used by the demo
*/
function onClickAbout() {
    showLoading();
    var cmd = [{"command":"about"}];
    $.ajax({
        url: '/exe/godoctor',
        type: 'POST',
        async: true,
        contentType: 'application/json',
        cache: false,
        dataType: 'json',
        data: JSON.stringify(cmd),
        success: function(data) {
            showDescription();
            var msg = data.text
              + '\n\n'
              + 'This online demonstration makes use of the following '
              + 'JavaScript libraries:'
              + '\n\n'
              + EDITOR_VERSION
              + '\n\n'
              + MENU_VERSION
              + '\n\n'
              + JQUERY_VERSION;
            alert(msg);
        },
        error: function() {
            alert("An error occurred while retrieving server information.");
        }
    });
    
}

/*
    Displays an error dialog.
*/
function alertError(cmd, xhr) {
    alert('An error occurred executing the ' + cmd + ' command.\n' +
        'Status: ' + xhr.statusText + '\n' +
        'Response: "' + xhr.responseText + '"');
}

/*
    Retrieves the list of refactorings from the server and adds them to the
    Refactor menu.
*/
function loadMenu() {
    var cmd = [{"command":"list","quality":"in_testing"}];
    $.ajax({
        url: '/exe/godoctor',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        cache: false,
        dataType: 'json',
        data: JSON.stringify(cmd),
        success: function(data) {
            var json = data;
            var transList = json.transformations;
            var menuItems = ['Refactor', null, null ];
            
            for (i = 0; i < transList.length; i++) {
                var obj = transList[i];
                menuItems.push([ obj.name, 'javascript:transform("'+obj.shortName+'")' ]);
            }

            MENU_ITEMS.push(menuItems);
            new menu(MENU_ITEMS, MENU_TPL);
        },
        error: function(xhr, textStatus, ex) {
            alertError('list', xhr);
        }
    });
}

/*
    Retrieves the list of parameters for a specific refactoring.
*/
function getParams(shortName) {
    var cmd = [{"command":"setdir","mode":"web"},
                {"command":"put","filename":"-.go","content":editor.getValue()},
                {"command":"params","transformation":shortName}];
    var result = JSON.parse(
        $.ajax({
            url: '/exe/godoctor',
            type: 'POST',
            async: false,
            contentType: 'application/json',
            cache: false,
            dataType: 'json',
            data: JSON.stringify(cmd),
            success: function(data) {
                
            },
            error: function(xhr, textStatus, ex) {
                alertError('params', xhr);
            }
        }).responseText);
    return result.params; 
}

/*
    Performs a refactoring.

    This function:
    1. Retrieves the parameters for the selected transformation.
    2. Prompts the user to supply an argument for each parameter.
    3. Performs the refactoring, passing it the supplied arguments.
*/
function transform(shortName) {
    var expectedArgs;
    expectedArgs = getParams(shortName);
    //alert(JSON.stringify(expectedArgs));
    var args = [];
    
    for (i = 0; i < expectedArgs.length; i++) {
        obj = expectedArgs[i];
        
        if (obj.type == "string") {
            input = prompt(obj.prompt);
            args.push(input);
        }
        if (obj.type == "boolean") {
            input = confirm(obj.prompt);
            args.push(input);
        }
    }

    selRange = editor.getSelectionRange();
    doc = editor.getSession().getDocument();
    startObj = { row:    selRange.start.row,
                 column: selRange.start.column};
    endObj   = { row:    selRange.end.row,
                 column: selRange.end.column};
    startIdx = doc.positionToIndex(startObj, 0);
    endIdx = doc.positionToIndex(endObj, 0);
    fullText = doc.getValue()
    textBefore = fullText.substring(0, startIdx);
    offset = numUTF8Bytes(textBefore);
    selectedText = fullText.substring(startIdx, endIdx);
    length = numUTF8Bytes(selectedText);
    cmd = {"command":"xrun",
            "transformation":shortName,
            "mode":"text",
            "textselection":{
                "filename":"-.go",
                "offset":offset,
                "length":length
            },
        "arguments":args};
    //alert(JSON.stringify(cmd));

    /*
    var startline = editor.getSelectionRange().start.row+1;
    var startcol = editor.getSelectionRange().start.column+1;
    var endline = editor.getSelectionRange().end.row+1;
    var endcol = editor.getSelectionRange().end.column+1;
    // ACE's selection is exclusive; the Go Doctor's is inclusive
    if (endcol > 1) {
        endcol--;
    } else {
        endline--;
        var line = editor.getSession().getDocument().getLine(endline-1);
        endcol = line.length+1;
    }

    cmd = {"command":"xrun",
            "transformation":shortName,
            "mode":"text",
            "textselection":{
                "filename":"-.go",
                "startline":startline,
                "startcol":startcol,
                "endline":endline,
                "endcol":endcol
            },
        "arguments":args};
    //alert(JSON.stringify(cmd));
    */

    transCmd = [{"command":"setdir","mode":"web"},
                {"command":"put","filename":"-.go","content":editor.getValue()},
                cmd];
    //alert(JSON.stringify(transCmd));

    $.ajax({
        url: '/exe/godoctor',
        type: 'POST',
        async: false,
        contentType: 'application/json',
        cache: false,
        dataType: 'json',
        data: JSON.stringify(transCmd),
        success: function(data) {
            if (data.reply == "Error") {
                alert(data.message);
                return;
            }
            showLog(data.log);
            try {
                editor.setValue(data.files[0].content);
            }
            catch(err) {
                // do nothing
            }
            
        },
        error: function(xhr, textStatus, ex) {
            alertError('xrun', xhr);
        }
    });
}

/*
    Returns the number of bytes in the UTF-8 encoding of a string.
    http://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
*/
function numUTF8Bytes(str) {
    // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
    var m = encodeURIComponent(str).match(/%[89ABab]/g);
    return str.length + (m ? m.length : 0);
}

/*
    Given the JSON error log returned from the xrun command, formats the log
    as HTML and displays it in the rightSide div.
*/
function showLog(log) {
    var html = ''
    for (var i = 0, len = log.length; i < len; i++) {
        var entry = log[i];

        if (entry.message.indexOf('Defaulting to file scope') == 0) {
            // Ignore this message; it doesn't make sense to display to someone
            // using the Web demo
            continue;
        }

        html += '<tr>';
        if (entry.severity == "error") {
            html += '<td class="tdtl"><span class="error">Error:&nbsp;</span></td>';
            html += '<td class="tdtl"><span class="message">';
        } else if (entry.severity == "warning") {
            html += '<td class="tdtl"><span class="warning">Warning:&nbsp;</span></td>';
            html += '<td class="tdtl"><span class="message">';
        } else {
            html += '<td>&nbsp;</td><td class="tdtl"><span class="info">';
        }
        html += $('<div/>').text(entry.message).html();
        html += '</span></td></tr>';
    }
    if (html == "") {
        html = '<p class="description">Refactoring completed successfully.</p>';
    } else {
        html = '<table border="0" cellspacing="1" cellpadding="1">' +
               html +
               '</table>';
    }
    $('#rightSide').html(html);
}
