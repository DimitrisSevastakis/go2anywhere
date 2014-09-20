//handles a selection, where it is done by mouse click or 'enter' button
function handleSelect(item){
    //get all open tabs
    chrome.tabs.query({},function(tabs){
        var s = $('#'+getTarget(item)+' '+ selected_item);
        var j;
        var tab_exists = false;
        //go through all the open tabs
        // chrome.tts.speak('<?xml version="1.0"?><speak>opening <emphasis>' + $('#'+getTarget(item)+' '+ selected_item + ' > span').text() + '</emphasis></speak>');
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
                    window.close();
                }else{
                //else open new tab
                    chrome.tabs.create({url: s.attr('href')});
                    window.close();
                }
            });
        }
    });
}

function handleDelete(){
    var srchSelected = $(selected_search).attr('id');
    switch(srchSelected){
        case 'bkmarks':
            deleteBookmark();
            break;
        case 'hstr':
            deleteHistoryItem();
            break;
        case 'tbs':
            closeTab();
            break;
    }
}

function moveUp(item){
    //moves up the cursor by one item
    var target = getTarget(item);
    s = $('#' + target+ ' '+ selected_item);
    if(!s.is(':first-child')){
        s.attr('data-selected', false);
        next = s.prev();
        next.attr('data-selected', true)
        if((next.offset().top)-5<$('#searchspace').height() + $('#searchspace').offset().top || (next.offset().top+next.height())>$('body').height()){
            offset_top = next.offset().top - next.parent().offset().top + $('#'+target +' > div').scrollTop();
            $('#'+target +' > div').scrollTop(offset_top -5);   
        } 
    }
}

function moveDown(item){
    //moves down the cursor by one item
    var target = getTarget(item);
    s = $('#' + target+ ' '+ selected_item);
    if(!s.is(':last-child')){
        s.attr('data-selected', false);
        next = s.next();
        next.attr('data-selected', true);
        if((next.offset().top+next.height())>$('body').height() || (next.offset().top)-5<$('#searchspace').height() + $('#searchspace').offset().top){
            offset_top = next.offset().top - next.parent().offset().top + $('#'+target +' > div').scrollTop();
            $('#'+target +' > div').scrollTop(offset_top + next.height() - $('#'+target +' > div').height() + 10 + parseInt(next.css("margin-bottom").replace('px','')));
        } 
    }
}