// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Search the bookmarks when entering the search keyword.


// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks(query) {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        $('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query));
    });
}
function dumpTreeNodes(bookmarkNodes, query) {
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], query);
    }
}

//fuzzy search function
function isMatch(str, q){
    var i;
    var index = new Array();
    for(i=0; i<q.length; i++){
        index[i] = str.indexOf(q.charAt(i));
        if(index[i] == -1){
            return -1;  
        } 
        str = str.substring(index[i]+1);
    }
    return index;
}

function dumpNode(bookmarkNode, query) {

    if (query && !bookmarkNode.children) {
        var predicate;

        //if '@' search this element's title of exact match
        if(query.indexOf('@') == 0){
            q = query.substring(1);
            predicate = String(bookmarkNode.title.toLowerCase()).indexOf(q.toLowerCase()) == -1;
        }
        //if '#' search this element's url for exact match
        else if(query.indexOf('#') == 0){
            q = query.substring(1);
            predicate = String(bookmarkNode.url.toLowerCase()).indexOf(q.toLowerCase()) == -1;
        }
        //else search this element's title for fuzzy match and url for exact match
        else{
            predicate = (isMatch(String(bookmarkNode.title.toLowerCase()), query.toLowerCase())==-1 && String(bookmarkNode.url.toLowerCase()).indexOf(query.toLowerCase()) == -1);
        }

        //if there is no match return empty element
        if(predicate == true){
            return $('<span></span>');
        }
    }
var anchor = $('<p>');
anchor.text(bookmarkNode.title);

/*
* When clicking on a bookmark in the extension, a new tab is fired with
* the bookmark url.
*/

    var span = $('<span>');
    var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' +
        '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' +
        '</td></tr></table>') : $('<input>');

    span.append(anchor);

    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        dumpTreeNodes(bookmarkNode.children, query);
    }
    li.append('<p id="urladdr">'+bookmarkNode.url +'</p>');
    if(!bookmarkNode.children) {
        li.attr('href', bookmarkNode.url);
        li.click(function() {
            chrome.tabs.create({url: bookmarkNode.url});
        });
    }

    if(!bookmarkNode.children) $('#bookmarks').append(li);
    
    $('li').css('background-color', '#293134').attr('data-selected', false);
    $('li:first').css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', 0);

}

//when the extension window is loaded do:
document.addEventListener('DOMContentLoaded', function () {
    //get bookmarks
    dumpBookmarks();
    $(function() {
        //on every key input check if 'enter' 'arrow-up' or 'arrow-down'
        $('#search').bind('input',function(event) {
            //default: filter bookmarks
            $('#bookmarks').empty();
            dumpBookmarks($('#search').val());
        });

        $('#search').keydown(function(event) {
            s = $('li[data-selected=true]');
            switch(event.which){
                case 13:
                    //case enter open selected bookmark
                    s.focus();
                    break;
                case 38:
                    //case up-arrow select previous bookmark
                    console.log('up');
                    if(parseInt(s.attr('data-ind'))>0){
                        $('li').css('background-color', '#293134').attr('data-selected', false);
                        $('li').eq(parseInt(s.attr('data-ind'))-1).css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))-1);
                    }
                    break;
                case 40:
                    //case up-arrow select previous bookmark
                    console.log('down');
                    if(parseInt(s.attr('data-ind'))<$('li').length){
                        $('li').css('background-color', '#293134').attr('data-selected', false);
                        $('li').eq(parseInt(s.attr('data-ind'))+1).css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))+1);
                    }
            }
        });
    });
    $("#search").focus();
});