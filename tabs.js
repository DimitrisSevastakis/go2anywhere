var tabList;

function loadTabs(){
	if(g2ajq('#tbs').attr('data-last-search') != g2ajq('#search').val() || g2ajq('#tabs li').length==0) updateTabs(g2ajq('#search').val());
	g2ajq('#results').animate({left: "0px"}, 250);
	g2ajq('.res').attr('data-search-selected', false);
	g2ajq('#tbs').attr('data-search-selected', true);
}

function closeTab(){
	var target = getTarget(g2ajq(selected_search).attr('id'));
	var visibleItems = g2ajq('#'+target+ ' >:not(.g2anomatch)');
	var indexSelected = visibleItems.index(g2ajq('#'+target+' > [data-selected=true]')[0]);

	var id = g2ajq(visibleItems[indexSelected]).attr('id');
	chrome.tabs.remove(parseInt(id));

	// tabList.splice(indexSelected);
	visibleItems[indexSelected].remove();
	visibleItems.splice(indexSelected,1);
	
	if(indexSelected >= visibleItems.length)
		indexSelected--;

	if(indexSelected >= 0)
		g2ajq(visibleItems[indexSelected]).attr('data-selected', true);

}

function updateTabs(){
	var query = g2ajq('#search').val();
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
	
	g2ajq('#tabs '+ selected_item).attr('data-selected', false);
	g2ajq('#tabs > :not(.g2anomatch):first').attr('data-selected', true);  
}

function dumpTabs(query){
	tabList = new Array();
	g2ajq('#tbs').attr('data-last-search', query);
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
			var anchor = g2ajq('<p>');
			var span = g2ajq('<span>');
			var textdiv = g2ajq('<div class="textContainer">');

			anchor.html(title);
			span.append(anchor);
			textdiv.append(span);

			var div = g2ajq('<div class="selectable" id="'+tabs[j].id+'">').append(textdiv);

			textdiv.append('<p class="urladdr">' + tabs[j].url +'</p>');
			if(selected_theme=="previews")
				div.append('<img class="go2anywherepreview"/>');
			if(selected_theme=="linepreviews")
				div.prepend('<img class="go2anywherepreview"/>');
			div.attr('href', tabs[j].url);
			//add item to list
			tabList[j] = div;
		}

		//empty old list
		g2ajq('#tabs').empty();
		//if not tabs match the search append message
		if(tabList.length == 0){
			g2ajq('#tabs').append(emptyList);
			return;
		}
		//append new list
		g2ajq('#tabs').append(tabList);

		//bind click action
		g2ajq('#tabs .selectable').click(function(event){
			g2ajq('#'+ getTarget(g2ajq(selected_search).attr('id')) +' '+ selected_item).attr('data-selected', false);
			g2ajq(this).attr('data-selected', true);
			handleSelect('tbs', 0);
		});
		//select the first tab in the list
		g2ajq('#tabs '+ selected_item).attr('data-selected', false);
		g2ajq('#tabs div:first').attr('data-selected', true);
	});
}