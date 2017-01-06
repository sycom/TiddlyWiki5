/*\
title: $:/plugins/tiddlywiki/googleanalytics/googleanalytics.js
type: application/javascript
module-type: startup

Runs Google Analytics with the account number in the tiddler `$:/GoogleAnalyticsAccount` and the domain name in `$:/GoogleAnalyticsDomain`

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// Export name and synchronous status
exports.name = "google-analytics";
exports.platforms = ["browser"];
exports.synchronous = true;

exports.startup = function() {
	// getting parameters
	var GA_ACCOUNT = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsAccount").replace(/\n/g,""),
		GA_DOMAIN = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsDomain").replace(/\n/g,"");
	if (GA_DOMAIN == "" || GA_DOMAIN == undefined) GA_DOMAIN = "auto";

	// using ga "isogram" function
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	// adding (optional) tracking internal navigation
	var GA_TRACKALL;
	if($tw.wiki.getTiddler("$:/GoogleAnalyticsTrackAll")) GA_TRACKALL = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsTrackAll").replace(/\n/g,"");
	else GA_TRACKALL = "no";
	if (GA_TRACKALL == "yes") {
		console.log("tracking-all");
		/*
		// enables "permalink" paradsdmeter on navigationadressbar
		$tw.wiki.setText("$:/config/Navigation/UpdateAddressBar","text","permalink");
		window.addEventListener("hashchange",function() {
			var hash = $tw.utils.getLocationHash();
			ga('set', 'page', '/#'+hash);
			ga('set', 'title', hash);
			console.log(hash);
			ga('send', 'pageview');
		})*/
		// create a hook on navigation to send data via tracker
		$tw.wiki.addEventListener("change",function(changes) {
			// dealing with user settings !todo check if options is associated with wiki or $tw
			var options = $tw.wiki.options || {},
				storyTitle = options.storyTitle || "$:/StoryList",
				historyTitle = options.historyTitle || "$:/HistoryList";
			// getting storyList (displayed) historyList (last displayed) and last item
			var storyList=$tw.wiki.getTiddler(storyTitle).fields.list;
			var historyList = JSON.parse($tw.wiki.getTiddlerText(historyTitle));
			var GA_CURRENT = historyList[historyList.length-1].title;
			// if last item has not been closed, prepare data and send to tracker
			if(storyList.includes(GA_CURRENT)) {
				// !todo check if history was modified
				console.log(changes.historyTitle.modified);
				console.log('send');
				}
			else console.log('don t send');
			console.log(GA_CURRENT);
		});
		/*$tw.rootWidget.addEventListener("tm-navigate",function(event) {
            console.log("track : "+event.actionTo);
        });
		$tw.hooks.addHook("th-track-internal-navigation",function(event) {
			console.log("track : "+event.navigateTo);
			return event;
		});
		$tw.hooks.invokeHook("th-track-internal-navigation",handleNavigateEvent());*/
	}
  // at first connection, should send all default pages to tracker?
  ga('create', GA_ACCOUNT, GA_DOMAIN);
  ga('send', 'pageview');
};

})();
