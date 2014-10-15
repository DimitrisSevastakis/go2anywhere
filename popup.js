var timeouts = {};
var emptyList = '<center><li>No Item Found</li></center>';
var selected_search = '[data-search-selected=true]';
var selected_item = 'li[data-selected=true]';

//when the extension window is loaded do:
document.addEventListener('DOMContentLoaded', function () { 
    theme = localStorage["selected_theme"];
    if(theme){
        $('head').append('<link rel="stylesheet" type="text/css" href="css/'+theme+'.css">');
        applyThemeSettings(theme);
    } 
    else{
        $('head').append('<link rel="stylesheet" type="text/css" href="css/now.css">');
        applyThemeSettings('now');
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
        //on every key input check if 'enter' 'delete' 'arrow-up' or 'arrow-down'
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
                    handleSelect(searchIn, event.shiftKey);
                    break;
                case 38:
                    //case up-arrow select previous bookmark
                    event.preventDefault();
                    moveUp(searchIn);
                    break;
                case 40:
                    //case up-arrow select previous bookmark
                    event.preventDefault();
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
                case 46:
                    handleDelete();
                    break;
                case 65:
                    // open all bookbarks
                    if(event.ctrlKey && (searchIn.indexOf("bkmarks")==0 || searchIn.indexOf("hstr")==0) ){
                        openAll(searchIn, event.shiftKey);
                    }
                    break;
                default:
                    $('#search').focus();
            }
        });
    });
    $("#search").focus();
});

function getTarget(item){
    //given the filter id, it returns the id of the 
    //corresponding result section
    var target;
    if(item=='bkmarks')
        target = 'bookmarks';
    else if (item == 'tbs')
        target = 'tabs';
    else if (item == 'hstr')
        target = 'history';
    return target;
}

function applyThemeSettings(theme){
    //run theme-specific actions
    console.log(theme);
    switch(theme){
        case 'now':
            console.log('i run');
            time = (new Date()).getHours();
            if(time <6 || time > 20){
                $('#searchspace').css({"background-image" : "url(../images/googlenow2.jpg)"});
            }
            break;
        default:
        //do nothing
    }
}
