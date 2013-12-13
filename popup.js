// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Search the bookmarks when entering the search keyword.


// Traverse the bookmark tree, and print the folder and nodes.
function dumpBookmarks(query) {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
       dumpTreeNodes(bookmarkTreeNodes, query, '/');
    });
}
function dumpTreeNodes(bookmarkNodes, query, parent) {
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], query, parent);
    }
}
String.prototype.replaceAt = function (i, char) {

    return this.substr(0, i) + char + this.substr(i + 1);

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

function dumpNode(bookmarkNode, query, parent) {
    var ind, i, temp;

    temp = String(bookmarkNode.title);
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
            ind = isMatch(String(bookmarkNode.title.toLowerCase()), query.toLowerCase());
            predicate = (ind==-1 && String(bookmarkNode.url.toLowerCase()).indexOf(query.toLowerCase()) == -1);            
        }

        //if there is no match return empty element
        if(predicate == true){
            return $('<span></span>');
        }
    }

    var anchor = $('<p>');
    anchor.html(temp);

    var span = $('<span>');
    span.append(anchor);

    var li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);

    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        var par = (!String(bookmarkNode.title)) ? parent : parent+'/' + bookmarkNode.title
        dumpTreeNodes(bookmarkNode.children, query, par.replace('//', '/'));
    }
    li.append('<p class="urladdr">'+bookmarkNode.url +'<span class="bookmark_path">('+parent +')</span></p>');
    if(!bookmarkNode.children) {
        li.attr('href', bookmarkNode.url);
        li.click(function() {
            $('li[data-selected=true]').css('background-color', '#293134').attr('data-selected', false);
            li.css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', 0);
            handleSelect();
        });
    }

    if(!bookmarkNode.children) $('#bookmarks').append(li);
    
    $('li[data-selected=true]').css('background-color', '#293134').attr('data-selected', false);
    $('li:first').css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', 0);

}


//handles a selection, where it is done by mouse click or 'enter' button
function handleSelect(){
    s = $('li[data-selected=true]');
    //get all open tabs
    tabs = chrome.tabs.query({},function(tabs){
        var j;
        var tab_exists = false;
        //go through all the open tabs
        for(j=0; j<tabs.length; j++){
            //if a tab already exists with this url bring that tab forth, along with its window
            if(tabs[j].url.replace('http://', '') == s.attr('href').replace('http://', '')){
                //bring window forth
                chrome.windows.update(tabs[j].windowId,{focused: true});
                //bring tab forth
                chrome.tabs.update(tabs[j].id, {active: true});
                tab_exists = true;
                break;
            }   
        }

        //handle opening of new tab
        if(!tab_exists){
            //get the currently focused tab
            chrome.tabs.getSelected(function(tab){
                if(tab.title == 'New Tab'){
                //if it is the 'New Tab' page open the url in the current tab
                    chrome.tabs.update(tab.id, {url: s.attr('href')});
                }else{
                //else open new tab
                    chrome.tabs.create({url: s.attr('href')});
                }
            });
        }
    });
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
                    handleSelect();
                    break;
                case 38:
                    //case up-arrow select previous bookmark
                    if(parseInt(s.attr('data-ind'))>0){
                        s.css('background-color', '#293134').attr('data-selected', false);
                        $('li').eq(parseInt(s.attr('data-ind'))-1).css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))-1);
                    }
                    break;
                case 40:
                    //case up-arrow select previous bookmark
                    if(parseInt(s.attr('data-ind'))<$('li').length){
                        s.css('background-color', '#293134').attr('data-selected', false);
                        $('li').eq(parseInt(s.attr('data-ind'))+1).css('background-color', '#3b4a50').attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))+1);
                    }
            }
        });
    });
    $("#search").focus();
});