//handles a selection, where it is done by mouse click or 'enter' button
function handleSelect(item, focus){
    //get all open tabs
    chrome.tabs.query({},function(tabs){
        var s = g2ajq('#'+getTarget(item)+' '+ selected_item);
        var j;
        var tab_exists = false;
        //go through all the open tabs
        // chrome.tts.speak('<?xml version="1.0"?><speak>opening <emphasis>' + g2ajq('#'+getTarget(item)+' '+ selected_item + ' > span').text() + '</emphasis></speak>');
        for(j=0; j<tabs.length; j++){
            //if a tab already exists with this url bring that tab forth, along with its window
            if(tabs[j].url.replace('http://', '') == s.attr('href').replace('http://', '')){
                //bring window forth
                chrome.windows.update(tabs[j].windowId,{focused: true});
                //bring tab forth
                chrome.tabs.getSelected(null, function(tab){
                    chrome.tabs.update(tabs[j].id, {active: true});
                    chrome.tabs.sendMessage(tab.id, {toggleGo2Anywhere: "true"}, function(response){});
                });
                window.close();
                tab_exists = true;
                break;
            }   
        }

        //handle opening of new tab
        if(!tab_exists){
            //get the currently focused tab
            chrome.tabs.getSelected(function(tab){
                var s = g2ajq('#'+getTarget(item)+' '+ selected_item);
                if(tab.title == 'New Tab'){
                //if it is the 'New Tab' page open the url in the current tab
                    chrome.tabs.update(tab.id, {url: s.attr('href')});
                }else{
                //else open new tab
                    if(focus){
                        chrome.tabs.create({active:false,url: s.attr('href')});
                    }
                    else{
                        chrome.tabs.create({url: s.attr('href')});
                    }
                }
                if(!focus){
                    chrome.tabs.sendMessage(tab.id, {toggleGo2Anywhere: "true"}, function(response){});
                    window.close();
                }
            });
        }
    });
}

function openAll(section, newWindow){
    //get all the children of the scrollable (should be list items)
    items = g2ajq("#"+getTarget(section)+" .scrollable").children();
    var n = 0;
    if (newWindow){
        first = items[0];
        items.splice(0,1);
        chrome.windows.create({url: g2ajq(first).attr('href')}, function(win){
            for (i = 0; i < items.length; i++){
                openInNewTab(items[i], win.id);
            }
        });
    }else{
        // loop though them all and open each link in a new tab
        for (i = 0; i < items.length; i++){
            openInNewTab(items[i], n);
        }
    }

}

function openInNewTab(item, winId){
    rl = g2ajq(item).attr('href');
    // chrome.windows.create();
    if (winId == 0){
        chrome.tabs.create({active:false,url: rl});
    }
    else{
        chrome.tabs.create({active:false, windowId: winId, url: rl});
    }
}

function handleDelete(){
    var srchSelected = g2ajq(selected_search).attr('id');
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
    var visibleItems = g2ajq('#'+target+ ' >:not(.g2anomatch)');
    
    var indexSelected = visibleItems.index(g2ajq('#'+target+' > [data-selected=true]')[0]);
    if(indexSelected > 0){
        g2ajq(visibleItems[indexSelected]).attr('data-selected', false);
        next = g2ajq(visibleItems[indexSelected-1]);
        next.attr('data-selected', true);
        if((next.offset().top+next.height())>g2ajq('body').height() || (next.offset().top)-5<g2ajq('#searchspace').height() + g2ajq('#searchspace').offset().top){
            offset_top = next.offset().top - next.parent().offset().top + g2ajq('#'+target).scrollTop();
            g2ajq('#'+target).scrollTop(offset_top + next.height() - g2ajq('#'+target).height() + 10 + parseInt(next.css("margin-bottom").replace('px','')));
        }
    }

    // var target = getTarget(item);
    // s = g2ajq('#' + target+ ' '+ selected_item);
    // if(!s.is(':first-child')){
    //     s.attr('data-selected', false);
    //     next = s.prev();
    //     next.attr('data-selected', true)
    //     if((next.offset().top)-5<g2ajq('#searchspace').height() + g2ajq('#searchspace').offset().top || (next.offset().top+next.height())>g2ajq('body').height()){
    //         offset_top = next.offset().top - next.parent().offset().top + g2ajq('#'+target).scrollTop();
    //         g2ajq('#'+target).scrollTop(offset_top -5);   
    //     } 
    // }
}

function moveDown(item){
    //moves down the cursor by one item
    var target = getTarget(item);
    var visibleItems = g2ajq('#'+target+ ' >:not(.g2anomatch)');
    
    var indexSelected = visibleItems.index(g2ajq('#'+target+' > [data-selected=true]')[0]);
    if(indexSelected < visibleItems.length -1){
        g2ajq(visibleItems[indexSelected]).attr('data-selected', false);
        next = g2ajq(visibleItems[indexSelected+1]);
        next.attr('data-selected', true);
        if((next.offset().top+next.height())>g2ajq('body').height() || (next.offset().top)-5<g2ajq('#searchspace').height() + g2ajq('#searchspace').offset().top){
            offset_top = next.offset().top - next.parent().offset().top + g2ajq('#'+target).scrollTop();
            g2ajq('#'+target).scrollTop(offset_top + next.height() - g2ajq('#'+target).height() + 10 + parseInt(next.css("margin-bottom").replace('px','')));
        }
    }
    // console.log(siblings);
    // s = g2ajq('#' + target+ ' '+ selected_item);
    // if(!s.is(':last-child')){
    //     s.attr('data-selected', false);
    //     next = s.next();
    //     next.attr('data-selected', true);
    //     if((next.offset().top+next.height())>g2ajq('body').height() || (next.offset().top)-5<g2ajq('#searchspace').height() + g2ajq('#searchspace').offset().top){
    //         offset_top = next.offset().top - next.parent().offset().top + g2ajq('#'+target).scrollTop();
    //         g2ajq('#'+target).scrollTop(offset_top + next.height() - g2ajq('#'+target).height() + 10 + parseInt(next.css("margin-bottom").replace('px','')));
    //     } 
    // }
}