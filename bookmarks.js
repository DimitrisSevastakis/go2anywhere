var bookmarkList;
var visit_count;
var search_id=0;

function loadBookmarks(){
    if(g2ajq('#bkmarks').attr('data-last-search') != g2ajq('#search').val()) updateBookmarks(g2ajq('#search').val()); 
    g2ajq('#results').animate({left: "-100%"}, 250);
    g2ajq('.res').attr('data-search-selected', false);
    g2ajq('#bkmarks').attr('data-search-selected', true);
}

function updateBookmarks(){
    var query = g2ajq('#search').val();
    bookmarkList.forEach(function(item, index){
        var title = item.find('span')[0].textContent
        var url = item.find('.urladdr')[0].textContent
        var bookmark_path = item.find('.bookmark_path')[0].textContent;
        bookmark_path = bookmark_path.substring(1, bookmark_path.length-1);
        
        var obj = {
            "title" : title,
            "url" : url,
        };

        var predicate = srch(obj, query, bookmark_path);
        if(predicate == true){
            item.removeClass('g2anomatch');
        }
        else{
            item.addClass('g2anomatch');
        }
    });

    g2ajq('#bookmarks '+ selected_item).attr('data-selected', false);
    g2ajq('#bookmarks > :not(.g2anomatch):first').attr('data-selected', true);  
}

//add bookmarks to the bookmark section
function dumpBookmarks(query) {
    search_id++;
    var current_search = search_id;
    g2ajq('#bkmarks').attr('data-last-search', query);
    bookmarkList = new Array();
    visit_count = new Array();
    //get the bookmarks tree
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
        //parse tree and add leaves to the list
        dumpTreeNodes(bookmarkTreeNodes, query, '/');
                
        //if there are no bookmarks
        if(bookmarkList.length==0){
            g2ajq('#bookmarks').empty();
            g2ajq('#bookmarks').append(emptyList);
            return;
        }
        //txt will contain all the urls of the bookmarks
        var txt = new Array();
        var htmltoreturn = g2ajq('<div id="tempholder"></div>');
        for(var i=0;i<bookmarkList.length;i++){
            txt[i] = bookmarkList[i].children('.textContainer').children('.urladdr').text();
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
                    g2ajq('#bookmarks').empty();
                    if(search_id!=current_search) return;
                    g2ajq('#bookmarks').append(templ);
                    // divtoreturn.append(templ);

                    //add click listener
                    g2ajq('#bookmarks .selectable').click(function(event){
                        g2ajq('#'+ getTarget(g2ajq(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
                        g2ajq(this).attr('data-selected', true);
                        handleSelect('bkmarks', 0);
                    });

                    //select the first bookmark in the list
                    g2ajq('#bookmarks '+ selected_item).attr('data-selected', false);
                    g2ajq('#bookmarks div:first').attr('data-selected', true);

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
    var predicate = !srch(bookmarkNode, query, parent);
    if(predicate == true){
        return g2ajq('<span></span>');
    }

    var anchor = g2ajq('<p>');
    var span = g2ajq('<span>');
    var textdiv = g2ajq('<div class="textContainer">');

    anchor.html(temp);
    span.append(anchor);

    var li = g2ajq('<div class="selectable" id="'+bookmarkNode.id+'">');
    // li.append('<div class="imgholder"><img class="bmtn" src="chrome://favicon/'+bookmarkNode.url+'"/></div>');
    textdiv.append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        var par = (!String(bookmarkNode.title)) ? parent : parent+'/' + bookmarkNode.title
        dumpTreeNodes(bookmarkNode.children, query, par.replace('//', '/'));
    }
    textdiv.append('<p class="urladdr">'+bookmarkNode.url +'<span class="bookmark_path">('+parent +')</span></p>');
    li.append(textdiv);
    
    if(selected_theme=="previews")
        li.append('<img class="go2anywherepreview"/>');
    
    if(selected_theme=="linepreviews")
        li.prepend('<img class="go2anywherepreview"/>');


    if(!bookmarkNode.children) {
        li.attr('href', bookmarkNode.url);
    }

    if(selected_theme == "previews" || selected_theme == "linepreviews"){
        li.append('<p class="preview"/>');
    }
    
    if(!bookmarkNode.children){
        bookmarkList.push(li);
        // g2ajq('#bookmarks > div').append(li);
    }
}

function deleteBookmark(){
    var srchSelected = g2ajq(selected_search).attr('id');
    var s = g2ajq('#'+getTarget(srchSelected)+' '+ selected_item);
    var d = confirm('Are you sure you want to delete the following bookmark? \n \'' + g2ajq('#bookmarks '+ selected_item + ' > span').text() + '\'');
    if(d){
        id = s.attr('id');
        next = (!s.is(':first-child')) ? s.prev() : s.next();
        next.attr('data-selected', true);
        s.remove();
        chrome.bookmarks.remove(id);
    }
}