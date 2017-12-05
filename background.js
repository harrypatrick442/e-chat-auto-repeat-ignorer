chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
	  if(tab.url)
	  {
		  if(tab.url.indexOf('e-chat.co')>=0)
		  {
			  chrome.tabs.executeScript(tab.ib, {
			file: 'inject.js'
			});
		  }
	  }  
  }

});