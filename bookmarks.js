var bookmarkList;
var visit_count;
var search_id=0;

function loadBookmarks(){
    if($('#bkmarks').attr('data-last-search') != $('#search').val()) dumpBookmarks($('#search').val()); 
    $('#results').animate({left: "-100%"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#bkmarks').attr('data-search-selected', true);
}

//add bookmarks to the bookmark section
function dumpBookmarks(query) {
    search_id++;
    var current_search = search_id;
    $('#bkmarks').attr('data-last-search', query);
    bookmarkList = new Array();
    visit_count = new Array();
    //get the bookmarks tree
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        //parse tree and add leaves to the list
        dumpTreeNodes(bookmarkTreeNodes, query, '/');
                
        //if there are no bookmarks
        if(bookmarkList.length==0){
            $('#bookmarks > div').empty();
            $('#bookmarks > div').append(emptyList);
            return;
        }
        //txt will contain all the urls of the bookmarks
        var txt = new Array();
        var htmltoreturn = $('<div id="tempholder"></div>');
        for(var i=0;i<bookmarkList.length;i++){
            txt[i] = bookmarkList[i].children('.urladdr').text();
            txt[i] = txt[i].substring(0,txt[i].indexOf('('));
            
            // get visit count for each bookmark
            chrome.history.getVisits({"url": txt[i]}, function (visits){
                //to kill some of the asynchronous stuff that is going on
                if(search_id!=current_search) return;
                visit_count[visit_count.length] = visits.length;

                //if we have all the visit counts do the following
                if(visit_count.length == bookmarkList.length){
                    var list = [];
                    for(j=0; j<bookmarkList.length; j++){
                        list.push({'item': bookmarkList[j], 'visit_count': visit_count[j]});
                    }
                    //sort bookmarks by most visited
                    list.sort(function(a, b) {
                        return ((a.visit_count > b.visit_count) ? -1 : ((a.visit_count == b.visit_count) ? 0 : 1));
                    });

                    //extract html elements from list
                    var templ = new Array();
                    for(j=0; j<bookmarkList.length; j++){
                        templ[j] = list[j].item;
                    }

                    //empty old list
                    $('#bookmarks > div').empty();
                    if(search_id!=current_search) return;
                    $('#bookmarks > div').append(templ);
                    // divtoreturn.append(templ);

                    //add click listener
                    $('#bookmarks .selectable').click(function(event){
                        $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
                        $(this).attr('data-selected', true);
                        handleSelect('bkmarks', 0);
                    });

                    //select the first bookmark in the list
                    $('#bookmarks '+ selected_item).attr('data-selected', false);
                    $('#bookmarks li:first').attr('data-selected', true);

                }
            });
        }
    });
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

    if(!bookmarkNode.children){
        bookmarkList[bookmarkList.length] = li;
        // $('#bookmarks > div').append(li);
    }
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