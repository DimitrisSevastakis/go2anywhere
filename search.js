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