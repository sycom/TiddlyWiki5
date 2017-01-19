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
    // testing do not track
    if(navigator.doNotTrack != 1) {
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
            // change informations about tracking
            $tw.wiki.setText("this wiki uses Google analytics","text",null,$tw.wiki.getTiddlerText("$:/plugins/tiddlywiki/googleanalytics/disclaimer_full"));
            /*
            $tw.hooks.addHook("th-opening-default-tiddlers-list",function(list) {
                list.unshift("this wiki uses Google analytics tracker - internal link mode");
                return list;
            });*/
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
    				// if history modified is true send tracker (else user may just closed another tiddler)
    				// note that clicking on a tiddlerlink from already opened tiddler will count
    				if(changes[historyTitle])  {
    					ga('set', 'page', window.location.pathname+'#'+GA_CURRENT);
    					ga('set', 'title', GA_CURRENT);
    					ga('send', 'pageview');
    				}
    			}
    		});
    	// ?at first connection, should send all default pages to tracker?
    	}
        else {
            // change informations about tracking
            $tw.wiki.setText("this wiki uses Google analytics","text",null,$tw.wiki.getTiddlerText("$:/plugins/tiddlywiki/googleanalytics/disclaimer_base"));
            // send data for whole page once only
            ga('create', GA_ACCOUNT, GA_DOMAIN);
            ga('send', 'pageview');
        }
    }
    else {
        // tells user tracker is installed but ineficient since DNT activated
        // change informations about tracking
        $tw.wiki.setText("this wiki uses Google analytics","text",null,$tw.wiki.getTiddlerText("$:/plugins/tiddlywiki/googleanalytics/disclaimer_dnt"));
    }
}
})();
