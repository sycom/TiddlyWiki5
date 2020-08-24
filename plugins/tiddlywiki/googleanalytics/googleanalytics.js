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
					gaTrackAll = $tw.wiki.getTiddlerText("$:/GoogleAnalyticsTrackAll", "no").replace(/\n/g, "");
        // Using ga "isogram" function
        (function(i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;
          i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
          }, i[r].l = 1 * new Date();
          a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
          a.async = 1;
          a.src = g;
          m.parentNode.insertBefore(a, m)
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
				if (gaTrackAll === "yes") {
					ga('create', gaAccount, gaDomain);
					// dealing with user settings !todo check if options is associated with wiki or $tw
					var options = $tw.wiki.options || {},
						storyTitle = options.storyTitle || "$:/StoryList",
						historyTitle = options.historyTitle || "$:/HistoryList";
					// getting storyList (displayed) historyList (last displayed) and last item
					var storyList = $tw.wiki.getTiddler(storyTitle).fields.list;
					var history = $tw.wiki.getTiddlerText(historyTitle) || "[{\"title\": \"" + storyList[0] + "\"}]";
					var historyList = JSON.parse(history);
					var gaCurrent = historyList[historyList.length - 1].title;
					// if last item has not been closed, prepare data and send to tracker
					if (storyList.includes(gaCurrent)) {
						// if history modified is true send tracker (else user may just closed another tiddler)
						// note that clicking on a tiddlerlink from already opened tiddler will count
						if (historyList.length === 1 || changes[historyTitle]) {
							ga('set', 'page', window.location.pathname + '/' + gaCurrent);
							ga('set', 'title', gaCurrent);
							ga('send', 'pageview');
						}
					}
				} else {
					// send data for whole page once only
					ga('create', gaAccount, gaDomain);
					ga('send', 'pageview');
				}
      };
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
