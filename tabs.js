var tabList;

function loadTabs(){
    if($('#tbs').attr('data-last-search') != $('#search').val() || $('#tabs li').length==0) updateTabs($('#search').val());
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

function updateTabs(){
    var query = $('#search').val();
    tabList.forEach(function(item, index){
        var title = item.find('span')[0].innerHTML
        var url = item.find('.urladdr')[0].innerHTML
        
        var obj = {
            "title" : title,
            "url" : url
        };

        var predicate = srch(obj, query, '');
        if(predicate == true){
            item.removeClass('g2anomatch');
        }
        else{
            item.addClass('g2anomatch');
        }
    });
    
    $('#tabs '+ selected_item).attr('data-selected', false);
    $('#tabs > :not(.g2anomatch):first').attr('data-selected', true);  
}

function dumpTabs(query){
    tabList = new Array();
    $('#tbs').attr('data-last-search', query);
    chrome.tabs.query({},function(tabs){
        var j;
        //go through all the open tabs
        for(j=0; j<tabs.length; j++){
            //if a tab already exists with this url bring that tab forth, along with its window
            var predicate = !srch(tabs[j], query, '');
            if(predicate == true){
                continue;
            }
            var title = tabs[j].title;
            var url = tabs[j].url;
            var anchor = $('<p>');
            var span = $('<span>');
            anchor.html(title);
            span.append(anchor);
            var div = $('<div class="selectable" id="'+tabs[j].id+'">').append(span);

            div.append('<p class="urladdr">' + tabs[j].url +'</p>');
            if(selected_theme=="previews")
                div.append('<img class="go2anywherepreview"/>');
            div.attr('href', tabs[j].url);
            //add item to list
            tabList[j] = div;
        }

        //empty old list
        $('#tabs').empty();
        //if not tabs match the search append message
        if(tabList.length == 0){
            $('#tabs').append(emptyList);
            return;
        }
        //append new list
        $('#tabs').append(tabList);

        //bind click action
        $('#tabs .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true);
            handleSelect('tbs', 0);
        });
        //select the first tab in the list
        $('#tabs '+ selected_item).attr('data-selected', false);
        $('#tabs div:first').attr('data-selected', true);
    });
}