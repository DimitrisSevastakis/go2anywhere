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
    if (!query) return true;
    if (query && !item.children) {
        //if '@' search this element's title of exact match
        if(query.indexOf('@') == 0){
            q = query.substring(1);
            predicate = String(item.title.toLowerCase()).indexOf(q.toLowerCase()) != -1;
            return predicate;
        }
        //if '#' search this element's url for exact match
        if(query.indexOf('#') == 0){
            q = query.substring(1);
            predicate = String(item.url.toLowerCase()).indexOf(q.toLowerCase()) != -1;
            return predicate;
        }
        //if '/' and in bookmarks, search elements with folder path that matches the query
        if($(selected_search).attr('id')=='bkmarks' && query.indexOf('/')==0){
            //if '|' exists, it marks the end of the bookmark path search string else the whole string is the query 
            var end = (query.indexOf('|')==-1) ? query.length : query.indexOf('|');
            q = query.substring(1, end);
            var queries = q.split('/');
            
            for(var i=0; i<queries.length; i++){
                if(parent.toLowerCase().indexOf(queries[i].toLowerCase()) == -1) return false;
            }

            if(query.indexOf('|')==-1) return true;  

            //if '|' character exists, do normal search on what follows
            queries = query.substring(query.indexOf('|')+1).split(' ');
            for(var i=0; i<queries.length; i++){
                if(!srch(item, queries[i], parent)) return false;
            }

            return true;
        }


        //else search this element's title for match and url for exact match
        var queries = query.split(' ');
        if(queries.length == 1 && queries[0] == '') return true;
        for(i=0; i<queries.length; i++){
            if (queries[i] == '') continue;
            if(String(item.title.toLowerCase()).indexOf(queries[i].toLowerCase()) == -1 
                && String(item.url.toLowerCase()).indexOf(queries[i].toLowerCase()) == -1) 
                    return false;
        }

        return true;
    }
}