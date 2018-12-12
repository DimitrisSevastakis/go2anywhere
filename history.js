var histList;
function loadHistory(){
    increment = g2ajq('#hstr').attr('data-search-increment');
    increment++;
    g2ajq('#hstr').attr('data-search-increment', increment);
    var q = g2ajq('#search').val();
    if(String(g2ajq('#hstr').attr('data-last-search')) !== q || g2ajq('#history > div').length==0) updateHistory();
    g2ajq('#results').animate({left: "-200%"}, 250);
    g2ajq('.res').attr('data-search-selected', false);
    g2ajq('#hstr').attr('data-search-selected', true);
}

function deleteHistoryItem(){
    var srchSelected = g2ajq(selected_search).attr('id');
    var s = g2ajq('#'+getTarget(srchSelected) + ' ' + selected_item);
    var url = g2ajq('#'+getTarget(srchSelected) + ' ' + selected_item +  ' .urladdr').text();
    var d = confirm('Are you sure you want to delete the following url? \n \'' + url + '\'');
    if(d){
        next = (!s.is(':first-child')) ? s.prev() : s.next();
        next.attr('data-selected', true);
        s.remove();
        chrome.history.deleteUrl({'url':url});
    }
}

function updateHistory(){
    var query = g2ajq('#search').val();
    histList.forEach(function(item, index){
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
    
    g2ajq('#history '+ selected_item).attr('data-selected', false);
    g2ajq('#history > :not(.g2anomatch):first').attr('data-selected', true);  
}

function dumpHistory(){
    console.log("dumping history");
    histList = new Array();
    g2ajq('#history').empty();
    var milliseconds = (new Date).getTime();
    chrome.history.search({'text': '', 'startTime': 0, 'endTime':milliseconds, 'maxResults':100} ,function(history){
        if(history.length == 0){
            g2ajq('#history').append(emptyList);
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
            //if a tab already exists with this url bring that tab forth, along with its window
            var title = history[j].title;
            var url = history[j].url;
            var anchor = g2ajq('<p>');
            var span = g2ajq('<span>');
            anchor.html(title);
            span.append(anchor);
            var div = g2ajq('<div class="selectable">').append(span);

            div.append('<p class="urladdr">' + history[j].url +'</p>');
            div.attr('href', history[j].url);

            histList.push(div);
            g2ajq('#history').append(div);
            
            // //select the first tab in the list
            g2ajq('#history '+ selected_item).attr('data-selected', false);
            g2ajq('#history div:first').attr('data-selected', true);
        }
        g2ajq('#history .selectable').click(function(event){
            g2ajq('#'+ getTarget(g2ajq(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
            g2ajq(this).attr('data-selected', true);
            handleSelect('hstr', 0);
        });
    });
}