var tabImages = {};
// remove unused images from storage
setInterval(function(){
	chrome.tabs.query({},function(tabs){
		var openUrls = {};
		for(j=0; j<tabs.length; j++){
			openUrls[encodeURI(tabs[j].url)] = 1;
		}
		getAllBookmarks(openUrls, function(urlitems){
			chrome.storage.local.get(null, function(items) {
				var allKeys = Object.keys(items);
				var newallimages = {};
				for (i=0; i < allKeys.length; i++){
					if (allKeys[i].startsWith("go2anywhereUrl/")){
						var url = decodeURI(allKeys[i].split("go2anywhereUrl/")[1]);
						if(!urlitems.hasOwnProperty(url))
							chrome.storage.local.remove(allKeys[i]);
						else{
							newallimages[url] = items[allKeys[i]];
						}
					}
				}
				tabImages = newallimages; 
			});
		});
	});

}, 10000);

function getAllBookmarks(bookmarkdict, callback){
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		parseTreeNodes(bookmarkTreeNodes, bookmarkdict);
		callback(bookmarkdict);
	});
}

function parseTreeNodes(bookmarkNodes, bookmarkdict) {
	var i;
	for (i = 0; i < bookmarkNodes.length; i++) {
		if(bookmarkNodes[i].children != undefined && bookmarkNodes[i].children.length > 0)
			parseTreeNodes(bookmarkNodes[i].children, bookmarkdict);

		if(bookmarkNodes[i].url != undefined && bookmarkNodes[i].url != "")
			bookmarkdict[encodeURI(bookmarkNodes[i].url)] = 1;
	}
}

function dumpNodeUrl(bookmarkNode, parent) {
	chrome.storage.local.get("go2anywhereUrl/" + encodeURI(bookmarkNode.url), function (result) {
		if(result){
			tabImages[bookmarkNode.url] = result;
		}
	});
}

function dumpTreeNodes(bookmarkNodes) {
	var i;
	for (i = 0; i < bookmarkNodes.length; i++) {
		dumpNode(bookmarkNodes[i], parent);
	}
}

function dumpNode(bookmarkNode, parent) {
	if(bookmarkNode.children != undefined && bookmarkNode.children.length > 0)
		dumpTreeNodes(bookmarkNode.children);
	chrome.storage.local.get("go2anywhereUrl/" + encodeURI(bookmarkNode.url), function (result) {
		if(result){
			tabImages[bookmarkNode.url] = result;
		}
	});
}

function getBookmaksImages(){
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		dumpTreeNodes(bookmarkTreeNodes);

	});
}

function SavePicture(tabId){
	try{
		chrome.tabs.captureVisibleTab(null, {format: "jpeg", quality: 10}, function(dataUrl){
			if(chrome.runtime.lastError){
			}
			else{
				chrome.tabs.get(tabId, function(tab){

					var key = tab.url;
					if(dataUrl){
						chrome.bookmarks.search(tab.url, function(results){
							tabImages[key] = dataUrl;
							var ekey = "go2anywhereUrl/" + encodeURI(key);
							var data = {};
							data[ekey] = dataUrl;
							chrome.storage.local.set(data, function() {
								chrome.storage.local.get(null, function(items) {
									var allKeys = Object.keys(items);
								});
							});
						});
					}
				});
			}
		});
	}
	catch(err){
		console.log("no permission to capture image");
	}
}

function GetImagesFromStorage(){
	chrome.storage.local.get(null, function(items) {
		var allKeys = Object.keys(items);
		for (i=0; i < allKeys.length; i++){
			tabImages[decodeUri(allKeys[i])] = Object[allKeys[i]];
		}
		console.log(allKeys);
	});
}


getBookmaksImages();

chrome.tabs.onActivated.addListener(function(details){
	SavePicture(details.tabId);
});


chrome.webNavigation.onCompleted.addListener(function(details) {
	chrome.tabs.getSelected(null, function(tab){
		if (tab.id == details.tabId){
			SavePicture(details.tabId);
		}
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type == "request"){
		if(request.options.type == "image-request-all"){
			sendResponse(tabImages);
		}
	}
});