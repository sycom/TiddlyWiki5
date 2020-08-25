/*\
title: $:/plugins/tiddlywiki/googleanalytics/googleanalytics.js
type: application/javascript
module-type: startup

Runs Google Analytics with the account number in the tiddler `$:/GoogleAnalyticsAccount` and the domain name in `$:/GoogleAnalyticsDomain`. You may also track internal navigation.

\*/
(function() {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    // Export name and synchronous status
    exports.name = "google-analytics";
    exports.platforms = ["browser"];
    exports.synchronous = true;

    var CONFIG_CONSENT_REQUIRED_TITLE = "$:/config/cookie-consent-required",
      CONSENT_TITLE = "$:/state/consent-banner/accepted"; // "": undeclared, "yes": accepted, "no": declined

    exports.startup = function() {
      var hasInitialised = false,
        dnt = navigator.doNotTrack || 0,
        initialiseGoogleAnalytics = function() {
          console.log("Initialising Google Analytics");
          hasInitialised = true;
          var gaAccount = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsAccount", "").replace(/\n/g, ""),
            gaDomain = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsDomain", "auto").replace(/\n/g, ""),
            gaTrackAll = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsTrackAll", "no").replace(/\n/g, ""),
            gaCurrent = "";

          (function(w, d, url) {
            let gaScript = d.createElement("script"),
              firstScript = d.getElementsByTagName("script")[0];
            gaScript.async = 1;
            gaScript.src = url;
            firstScript.parentNode.insertBefore(gaScript, firstScript)
            w.dataLayer = w.dataLayer || [];
            function gtag() {
              dataLayer.push(arguments);
            }
            gtag("js", new Date());
						if (gaTrackAll === "yes") {
	            // dealing with user settings !todo check if options is associated with wiki or $tw
	            let options = $tw.wiki.options || {},
	              storyTitle = options.storyTitle || "$:/StoryList",
	              historyTitle = options.historyTitle || "$:/HistoryList";
							let storyList, history, historyList;
	            $tw.wiki.addEventListener("change", function(changes) {
								storyList = $tw.wiki.getTiddler(storyTitle).fields.list;
								history = $tw.wiki.getTiddlerText(historyTitle) || "[{\"title\": \"" + storyList[0] + "\"}]";
								historyList = JSON.parse(history);
	              if (historyList.length === 1 || changes[historyTitle]) {
	               // getting storyList (displayed) historyList (last displayed) and last item
	                  gaCurrent = historyList[historyList.length - 1].title;
										// !todo: check if tiddler is missing and add "missing: " mention to the title
										console.log("dernier tiddler: "+gaCurrent);
	                }
	              });
	              gtag("config", gaAccount, {
	                'page_title': gaCurrent
	              });
	            }
	          else {
	            // send data for whole page once only
	            gtag("config", gaAccount);
	          }
          })(window, document, "https://www.googletagmanager.com/gtag/js")
        }
    // Initialise now if consent isn't required
    if ($tw.wiki.getTiddlerText(CONFIG_CONSENT_REQUIRED_TITLE) !== "yes") {
      initialiseGoogleAnalytics();
    } else {
      // Or has been granted already
      if ($tw.wiki.getTiddlerText(CONSENT_TITLE) === "yes") {
        initialiseGoogleAnalytics();
      } else {
        // Or when our config tiddler changes
        $tw.wiki.addEventListener("change", function(changes) {
          if (changes[CONSENT_TITLE]) {
            if (!hasInitialised && $tw.wiki.getTiddlerText(CONSENT_TITLE) === "yes") {
              initialiseGoogleAnalytics();
            }
          }
        });
      }
    }
  };

})();
