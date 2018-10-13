function getBookmaksImages(){
	chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
		dumpTreeNodes(bookmarkTreeNodes);

	});
}

function dumpTreeNodes(bookmarkNodes) {
    var i;
    for (i = 0; i < bookmarkNodes.length; i++) {
        dumpNode(bookmarkNodes[i], parent);
    }
}

function dumpNode(bookmarkNode, parent) {
    chrome.storage.local.get(bookmarkNode.url, function (result) {
        if(result){
        	tabImages[bookmarkNode.url] = result;
        }
    });
}

function SavePicture(tabId){
	chrome.tabs.captureVisibleTab(null, {format: "jpeg", quality: 30}, function(dataUrl){
		chrome.tabs.get(tabId, function(tab){
			var key = tab.url;
			if(dataUrl){
				chrome.bookmarks.search(tab.url, function(results){
					tabImages[tab.url] = dataUrl;
					if(results && results.length > 0){
						chrome.storage.local.set({ key : dataUrl}, function() {
						});
					}
				});
			}
		});
	});
}

var tabImages = {};

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