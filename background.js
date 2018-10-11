var tabImages = {};
function SavePicture(tabId){
	chrome.tabs.captureVisibleTab(null, {format: "jpeg", quality: 30}, function(dataUrl){
		chrome.tabs.get(tabId, function(tab){
			var key = tab.url;
			if(dataUrl){
				chrome.bookmarks.search(tab.url, function(results){
					if(results && results.length > 0){
						chrome.storage.local.set({ key : dataUrl}, function() {
						});
					}
					else{
						tabImages[tab.url] = dataUrl;
					}
				});
			}
		});
	});
}

chrome.tabs.onActivated.addListener(function(details){
	// var index = tabsToCheck.indexOf(details.tabId);
	// if( index == -1)
	// 	return;
	SavePicture(details.tabId);
	// tabsToCheck.splice(index, 1);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type == "request"){
		if(request.options.type == "image-request-all"){
			sendResponse(tabImages);
		}
	}
});