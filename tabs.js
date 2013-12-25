var tabList;

function loadTabs(){
    if($('#tbs').attr('data-last-search') != $('#search').val() || $('#tabs li').length==0) dumpTabs($('#search').val());
    $('#results').animate({left: "0px"}, 250);
    $('.res').attr('data-search-selected', false);
    $('#tbs').attr('data-search-selected', true);
}

function closeTab(){
    var srchSelected = $(selected_search).attr('id');
    var s = $('#'+getTarget(srchSelected)+' '+ selected_item);
    id = s.attr('id');
    next = (!s.is(':first-child')) ? s.prev() : s.next();
    next.attr('data-selected', true);
    s.remove();
    chrome.tabs.remove(parseInt(id));
}

function dumpTabs(query){
    tabList = new Array();
    $('#tbs').attr('data-last-search', query);
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
            var li = $('<li class="selectable" id="'+tabs[j].id+'">').append(span);

            li.append('<p class="urladdr">' + tabs[j].url +'</p>');
            li.attr('href', tabs[j].url);
            //add item to list
            tabList[j] = li;
        }
        //empty old list
        $('#tabs > div').empty();
        //append new list
        $('#tabs > div').append(tabList);

        $('#tabs .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true);
            handleSelect('tbs');
        });
        //select the first tab in the list
        $('#tabs '+ selected_item).attr('data-selected', false);
        $('#tabs li:first').attr('data-selected', true);
    });
}