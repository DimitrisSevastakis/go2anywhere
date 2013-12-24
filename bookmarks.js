function loadBookmarks(){
    if($('#bkmarks').attr('data-last-search') != $('#search').val()) dumpBookmarks($('#search').val()); 
    $('#results').animate({left: "-600px"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#bkmarks').attr('data-search-selected', true);
}

//add bookmarks to the bookmark section
function dumpBookmarks(query) {
    $('#bookmarks > div').empty();
    //get the bookmarks tree
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        //parse tree and add leaves to the list
       dumpTreeNodes(bookmarkTreeNodes, query, '/');
       if($('#bookmarks li').length == 0) $('#bookmarks > div').append(emptyList);
       $('#bookmarks .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true);
            handleSelect('bkmarks');
        });
    });
    $('#bkmarks').attr('data-last-search', query);
}

// Traverse the bookmark tree, and print the folder and nodes.
function dumpTreeNodes(bookmarkNodes, query, parent) {
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], query, parent);
    }
}

function dumpNode(bookmarkNode, query, parent) {
    var ind, i, temp;

    temp = String(bookmarkNode.title);

    //if there is no match return empty element
    var predicate = srch(bookmarkNode, query, parent);
    if(predicate == true){
        return $('<span></span>');
    }

    var anchor = $('<p>');
    var span = $('<span>');
    anchor.html(temp);
    span.append(anchor);

    var li = $('<li class="selectable" id="'+bookmarkNode.id+'">');
    // li.append('<div class="imgholder"><img class="bmtn" src="chrome://favicon/'+bookmarkNode.url+'"/></div>');
    li.append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        var par = (!String(bookmarkNode.title)) ? parent : parent+'/' + bookmarkNode.title
        dumpTreeNodes(bookmarkNode.children, query, par.replace('//', '/'));
    }
    li.append('<p class="urladdr">'+bookmarkNode.url +'<span class="bookmark_path">('+parent +')</span></p>');
    if(!bookmarkNode.children) {
        li.attr('href', bookmarkNode.url);
    }

    if(!bookmarkNode.children) $('#bookmarks > div').append(li);
    
    //select the first bookmark in the list
    $('#bookmarks '+ selected_item).attr('data-selected', false);
    $('#bookmarks li:first').attr('data-selected', true);
}

function deleteBookmark(){
    var srchSelected = $(selected_search).attr('id');
    var s = $('#'+getTarget(srchSelected)+' '+ selected_item);
    var d = confirm('Are you sure you want to delete the following bookmark? \n \'' + $('#bookmarks '+ selected_item + ' > span').text() + '\'');
    if(d){
        id = s.attr('id');
        next = (!s.is(':first-child')) ? s.prev() : s.next();
        next.attr('data-selected', true);
        s.remove();
        chrome.bookmarks.remove(id);
    }
}