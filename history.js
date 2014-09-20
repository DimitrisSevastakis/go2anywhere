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

function deleteHistoryItem(){
    var srchSelected = $(selected_search).attr('id');
    var s = $('#'+getTarget(srchSelected) + ' ' + selected_item);
    var url = $('#'+getTarget(srchSelected) + ' ' + selected_item +  ' .urladdr').text();
    var d = confirm('Are you sure you want to delete the following url? \n \'' + url + '\'');
    if(d){
        next = (!s.is(':first-child')) ? s.prev() : s.next();
        next.attr('data-selected', true);
        s.remove();
        chrome.history.deleteUrl({'url':url});
    }
}

function dumpHistory(query, increment){
    $('#hstr').attr('data-last-search', query);
    if(increment!=parseInt($('#hstr').attr('data-search-increment'))) return;
    $('#history > div').empty();
    chrome.history.search({'text': query},function(history){
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
            $('#history li:first').attr('data-selected', true);
        }
        $('#history .selectable').click(function(event){
            $('#'+ getTarget($(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            $(this).attr('data-selected', true);
            handleSelect('hstr');
        });
    });
}