// Traverse the bookmark tree, and print the folder and nodes.
var timeouts = {};
var emptyList = '<center><li>No Item Found</li></center>';
var selected_search = '[data-search-selected=true]';
var selected_item = 'li[data-selected=true]';

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
            $(this).attr('data-selected', true).attr('data-ind', 0);
            handleSelect('bkmarks');
        });
    });
    $('#bkmarks').attr('data-last-search', query);
}
function dumpTreeNodes(bookmarkNodes, query, parent) {
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], query, parent);
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

function srch(item, query, parent){
    var predicate = false;
    
    if (query && !item.children) {
        //if '@' search this element's title of exact match
        if(query.indexOf('@') == 0){
            q = query.substring(1);
            predicate = String(item.title.toLowerCase()).indexOf(q.toLowerCase()) == -1;
            return predicate;
        }
        //if '#' search this element's url for exact match
        if(query.indexOf('#') == 0){
            q = query.substring(1);
            predicate = String(item.url.toLowerCase()).indexOf(q.toLowerCase()) == -1;
            return predicate;
        }
        //else search this element's title for fuzzy match and url for exact match
        if($(selected_search).attr('id')=='bkmarks' && query.indexOf('>')==0){
            q = query.substring(1);
            var queries = q.split(' ');
            for(var i=0; i<queries.length; i++){
                if(parent.toLowerCase().indexOf(queries[i].toLowerCase())==-1) return true;
            }
          return predicate;  
        }

        // ind = isMatch(String(item.title.toLowerCase()), query.toLowerCase());
        // predicate = (ind==-1 && String(item.url.toLowerCase()).indexOf(query.toLowerCase()) == -1);   

        var queries = query.split(' ');

        for(i=0; i<queries.length; i++){
            if(String(item.title.toLowerCase()).indexOf(queries[i].toLowerCase())==-1 && String(item.url.toLowerCase()).indexOf(queries[i].toLowerCase())==-1) return true;
        }
        return predicate;
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

    var li = $('<li class="selectable">').append(span);

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
    $('#bookmarks li:first').attr('data-selected', true).attr('data-ind', 0);
}

function dumpTabs(query){
    $('#tbs').attr('data-last-search', query);
    $('#tabs > div').empty();
    chrome.tabs.query({},function(tabs){
        if(tabs.length == 0){
            $('#tabs > div').append(emptyList);
            return;
        }
        var j;
        //go through all the open tabs
        for(j=0; j<tabs.length; j++){
            //if a tab already exists with this url bring that tab forth, along with its window
            var predicate = srch(tabs[j], query, '');
            if(predicate == true){
                continue;
            }
            var title = tabs[j].title;
            var url = tabs[j].url;
            var anchor = $('<p>');
            var span = $('<span>');
            anchor.html(title);
            span.append(anchor);
            var li = $('<li class="selectable">').append(span);

            li.append('<p class="urladdr">' + tabs[j].url +'</p>');
            li.attr('href', tabs[j].url);
            $('#tabs > div').append(li);
            
            // //select the first tab in the list
            $('#tabs '+ selected_item).attr('data-selected', false);
            $('#tabs li:first').attr('data-selected', true).attr('data-ind', 0);
        }
        $('#tabs .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true).attr('data-ind', 0);
            handleSelect('tbs');
        });
    });
}

function dumpHistory(query, increment){
    $('#hstr').attr('data-last-search', query);
    if(increment!=parseInt($('#hstr').attr('data-search-increment'))) return;
    $('#history > div').empty();
    chrome.history.search({'text': query, 'maxResults': 50},function(history){
        if(increment!=parseInt($('#hstr').attr('data-search-increment'))) return;
        if(history.length == 0){
            $('#history > div').append(emptyList);
            return;
        }
        var j;
        var visit_count = new Array();
        var list = [];
        for(j=0; j<history.length; j++){
            visit_count[j] = history[j].visitCount;
            list.push({'item': history[j], 'visit_count': visit_count[j]});
        }
        list.sort(function(a, b) {
            return ((a.visit_count > b.visit_count) ? -1 : ((a.visit_count == b.visit_count) ? 0 : 1));
        });

        for (var k=0; k<list.length; k++) {
            history[k] = list[k].item;
            visit_count[k] = list[k].visit_count;
        }
       
        for(j=0; j<history.length; j++){
            if(increment!=parseInt($('#hstr').attr('data-search-increment'))) return;
            //if a tab already exists with this url bring that tab forth, along with its window
            var title = history[j].title;
            var url = history[j].url;
            var anchor = $('<p>');
            var span = $('<span>');
            anchor.html(title);
            span.append(anchor);
            var li = $('<li class="selectable">').append(span);

            li.append('<p class="urladdr">' + history[j].url +'</p>');
            li.attr('href', history[j].url);
            $('#history > div').append(li);
            
            // //select the first tab in the list
            $('#history '+ selected_item).attr('data-selected', false);
            $('#history li:first').attr('data-selected', true).attr('data-ind', 0);
        }
        $('#history .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true).attr('data-ind', 0);
            handleSelect('hstr');
        });
    });
    
}

//handles a selection, where it is done by mouse click or 'enter' button
function handleSelect(item){
    //get all open tabs
    chrome.tabs.query({},function(tabs){
        var s = $('#'+getTarget(item)+' '+ selected_item);
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
                var s = $('#'+getTarget(item)+' '+ selected_item);
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

function getTarget(item){
    var target;
    if(item=='bkmarks')
        target = 'bookmarks';
    else if (item == 'tbs')
        target = 'tabs';
    else if (item == 'hstr')
        target = 'history';

    return target;
}

function moveUp(item){
    var target = getTarget(item);
    s = $('#' + target+ ' '+ selected_item);
    if(parseInt(s.attr('data-ind'))>0){
        s.attr('data-selected', false);
        next = $('#' + target+ ' li').eq(parseInt(s.attr('data-ind'))-1);
        next.attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))-1);
        //if((s.offset().top)<$('#searchspace').offset().top+$('#searchspace').height()){
        if((next.offset().top)-5<$('#searchspace').height() + $('#searchspace').offset().top || (next.offset().top+next.height())>$('body').height()){
            offset_top = next.offset().top - next.parent().offset().top + $('#'+target +' > div').scrollTop();
            $('#'+target +' > div').scrollTop(offset_top -5);   
        } 
    }
}

function moveDown(item){
    var target = getTarget(item);
    s = $('#' + target+ ' '+ selected_item);
    if(parseInt(s.attr('data-ind'))<$('#' + target+ ' li').length-1){
        s.attr('data-selected', false);
        next = $('#' + target+ ' li').eq(parseInt(s.attr('data-ind'))+1);
        next.attr('data-selected', true).attr('data-ind', parseInt(s.attr('data-ind'))+1);
        if((next.offset().top+next.height())>$('body').height() || (next.offset().top)-5<$('#searchspace').height() + $('#searchspace').offset().top){
            offset_top = next.offset().top - next.parent().offset().top + $('#'+target +' > div').scrollTop();
            $('#'+target +' > div').scrollTop(offset_top + next.height() - $('#'+target +' > div').height() + 5 + parseInt(next.css("margin-bottom").replace('px','')));
        } 
    }
}

function loadTabs(){
    if($('#tbs').attr('data-last-search') != $('#search').val() || $('#tabs li').length==0) dumpTabs($('#search').val());
    $('#results').animate({left: "0px"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#tbs').attr('data-search-selected', true);
}

function loadBookmarks(){
    if($('#bkmarks').attr('data-last-search') != $('#search').val()) dumpBookmarks($('#search').val()); 
    $('#results').animate({left: "-600px"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#bkmarks').attr('data-search-selected', true);
}

function loadHistory(){
    increment = $('#hstr').attr('data-search-increment');
    increment++;
    $('#hstr').attr('data-search-increment', increment);
    var q = $('#search').val();

    if(String($('#hstr').attr('data-last-search')) !== q || $('#history li').length==0) dumpHistory(q,increment);
    $('#results').animate({left: "-1200px"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#hstr').attr('data-search-selected', true);
}

function createHistoryAlarm(){
    chrome.alarms.clear('history_update');
    chrome.alarms.create('history_update',{when:Date.now()+500});

}

//when the extension window is loaded do:
document.addEventListener('DOMContentLoaded', function () {   
    theme = localStorage["selected_theme"];
    if(theme){
        $('head').append('<link rel="stylesheet" type="text/css" href="css/'+theme+'.css">');
    } 
    else{
        $('head').append('<link rel="stylesheet" type="text/css" href="css/default.css">');
    }
    //get bookmarks
    dumpBookmarks();
    $('#hstr').attr('data-search-increment', 0);
    //select bookmarks as the default search
    $('#filters td').attr('data-search-selected', false);
    $('#bkmarks').attr('data-search-selected', true);
    $('.res').attr('data-last-search', '');
    chrome.alarms.onAlarm.addListener(loadHistory);

    $(function() {
        //on every key input check if 'enter' 'arrow-up' or 'arrow-down'
        $('.res').click(function(event){
            switch(event.target.id){
                case 'tbs':
                    if($(selected_search).attr('id') != 'tbs') loadTabs();
                    break;
                case 'bkmarks':
                    if($(selected_search).attr('id') != 'bkmarks') loadBookmarks();
                    break;
                case 'hstr':
                    if($(selected_search).attr('id') != 'hstr') loadHistory();
                    break;
            }
        });

        $('#search').bind('input',function(event) {
            //default: filter bookmarks
            searchIn = String($(selected_search).attr('id'));
            if(searchIn == 'bkmarks') loadBookmarks();
            else if(searchIn == 'tbs') loadTabs();
            else if(searchIn == 'hstr') createHistoryAlarm();
        });

        $('body').keydown(function(event) {
            searchIn = String($(selected_search).attr('id'));
            switch(event.which){
                case 13:
                    //case enter open selected bookmark
                    handleSelect(searchIn);
                    break;
                case 38:
                    //case up-arrow select previous bookmark
                    moveUp(searchIn);
                    break;
                case 40:
                    //case up-arrow select previous bookmark
                    moveDown(searchIn);
                    break;
                case 37:
                    //left arrow
                    if(event.ctrlKey){
                        event.preventDefault();
                        if(searchIn.indexOf("bkmarks")==0){
                            loadTabs();
                        }else if(searchIn.indexOf("hstr")==0){
                            loadBookmarks();
                        }
                    }
                    break;
                case 39:
                    //right arrow
                    if(event.ctrlKey){
                        event.preventDefault();
                        if(searchIn.indexOf("bkmarks")==0){
                            loadHistory();
                        }else if(searchIn.indexOf("tbs")==0){
                            loadBookmarks();
                        }
                    }
                    break;
                default:
                    $('#search').focus();
            }
        });
    });
    $("#search").focus();
});