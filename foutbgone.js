'use strict'; 

var FoutBGone = function () {
	// how often (in ms) to check if test node has been styled
	// with last custom font in list
	var testFrequency = 20;

	// number of ms before it stops checking
	// (i.e., custom font style was not applied)
	var giveup = 3000;

	/**
	 * Enum for possible when states
	 * @enum {String}
	 */
	var whenStates = {
		ASAP: 'asap',
		DOMREADY: 'domready',
		ONLOAD: 'onload'
	};

	/**
	 * Wrapper function that adds event listener for window onload event with
	 * fallback to attachEvent.
	 * @param {Function} callback
	 */
	var addOnLoadEventListener = function (callback) {
		if (window.addEventListener) {
			addEventListener('load', callback, false);
		} else {
			attachEvent('onload', callback);
		}
	};

	/**
	 * Inventories custom fonts used on a page and selectively hides only DOM
	 * elements that would cause flash-of-unstyled-text (FOUT).
	 * @param  {whenStates} when - One from the possible enumeration whenState
	 *                           	 values whichs tells when hidden content will
	 *                           	 revert to visible (optimum varies by page and
	 *                           	 browser).
	 * @param  {Number} [delay=100] - Time between test node being detected as
	 *                              	styled and hidden nodes being exposed.
	 * @return {[type]}
	 */
	return function (when, delay) {
		// Target only IE and Firefox 3.x are those w/ FOUT problem by filtering
		// out all other browsers
		if (navigator.appName !== 'Microsoft Internet Explorer' &&
				!/Firefox\/3/.test(navigator.userAgent)) {
			return;
		}

    delay = delay || 100;

    // List of fontnames used in css
    var fontnames = [];

    // TODO: comment
    var fontRules = [];

    // TODO: comment
    var selectors = [];

    // TODO: comment
    var isCompliant = true;

    // get all custom fonts declared through @font-face rules and make list of
    // all non-in-line css style rules in page
    for (var i = 0, l = document.styleSheets.length; i < l; i++) {
    	var stylesheet = document.styleSheets[i];

    	// find @font-face rules "manually" for IE8, IE7, etc.
    	if (!stylsheet.cssRules) {
        isCompliant = false;

        var fontFaceReplacer = function (matchedSubString, t) {
        	var replaceRegex = /([\s\S]*)(font-family:\s*['"]?)([-_0-9a-zA-Z]+)([\s\S]*)/;

        	// get a font name replace with third group
        	var fontname = matchedSubString.replace(replaceRegex, '$3');
        	fontnames.push(fontname);
        	return matchedSubString;
        };

	      stylsheet.cssText.replace(/@font-face\s*\{([^\}]+)\}/ig, fontFaceReplacer);
    	}

      var fontFaceRules = stylsheet.cssRules || stylsheet.rules;

      for (var j = 0, ll = fontFaceRules.length; j < ll; j++) {
        var rule = fontFaceRules[j];

        if (isCompliant && rule instanceof CSSFontFaceRule) {
        	var replaceRegex = /([\s\S]*)(font-family:\s*['"]?)([-_0-9a-zA-Z]+)([\s\S]*)/;
          var fontname = rule.cssText.replace(replaceRegex, '$3');
          fontnames.push(fontname);
        } else {
        	// CSSStyleRule
	        fontRules.push(rul);
	      }
      }
    }

    // make a list of all style rules that use a custom font
    for (var i = 0; i < fontnames.length; i++) {
    	var fontname = fontnames[i];

      for (var j = 0; j < fontRules.length; j++) {
      	var fontRule = fontRules[j];
        var csstxt = isCompliant ? fontRule.cssText : fontRule.style.cssText;

        if (csstxt.indexOf(fontnames) > -1) {
          selectors.push(fontRule.selectorText);
        }
      }
    }

    // create a span node to be used for measuring default-font-styled vs
    // custom-font-styled
    // Note: the span technique is modeled after code developed by Paul Irish
    // Reference: http://paulirish.com/2009/font-face-feature-detection
    var body = document.body || document.documentElement;
    var span = document.createElement('span');
    span.setAttribute('style', 'font:99px _,serif;position:absolute;visibility:hidden');
    span.style.visibility = 'hidden'; //fixes ie7 text flashing bug
    span.innerHTML = '-------';
    span.id = 'fonttest';
    body.appendChild(span);

    //var wid = span.offsetWidth;		//moved further down; even though innerHTML was already set above, this is too early for IE

    //create a new stylesheet to store new classes with visibility:hidden for all nodes with custom fonts 
    var stl1 = document.createElement('style');
    document.getElementsByTagName("head")[0].appendChild(stl1);
    var allhidden = '';
    for (var i = 0; i < selectors.length; i++)
      allhidden += (selectors[i] + (i < (selectors.length - 1) ? ', ' : ' '));
    allhidden += '{visibility:hidden}';
    if (stl1.styleSheet) stl1.styleSheet.cssText = allhidden; //IE8, IE7
    else stl1.textContent = allhidden; //e.g., "h1,div.test{visibility:hidden}";

    span.style.font = '99px "' + fontnames[fontnames.length - 1] + '",_,serif'; //apply custom font to test node, e.g., 'URWGroteskT_LigNar'

    var wid = span.offsetWidth; //at this time, tests in newer browsers (not IE7/IE8) show this as still the width of the original default-font

    //alert('before: ' + span.offsetWidth);											//test:  shows width for default font
    //setTimeout(function(){alert('after: ' + span.offsetWidth);}, 1000);			//test:  shows width for custom font		

    var temp1 = '';
    var freq = test_frequency;

    var showHidden = function() {
      var fnttest = setInterval(function() {
        if (!wid && document.body) //for the benefit of IE7 and IE8
        {
          body.removeChild(span);
          document.body.appendChild(span);
          wid = span.offsetWidth;
        }
        var nu_wid = span.offsetWidth;
        temp1 += (nu_wid + '   '); //temp1 is used for dev only
        giveup -= freq;
        if (wid != nu_wid || giveup <= 0) {
          clearInterval(fnttest);
          setTimeout(function() {
            stl1.parentNode.removeChild(stl1);
          }, delay); //even 'asap' needs a small delay
          if (giveup <= 0 && self.onFontFaceFailed) self.onFontFaceFailed();
          span.parentNode.removeChild(span);
        }
      }, freq);
    }

    //decide when to start testing if custom font has been applied
    if (when == 'asap') showHidden();
    //else if (when == 'domready') head.ready("dom", showHidden);		//'domready' requires head.js (temporarily not supported)
    else if (when == 'onload') addWindowLoadEventListener(showHidden);
    else showHidden(); //default is same as ('asap',100)


    if (window.TESTCAPTURE) //dev testing only (optional)
    {
      addWindowLoadEventListener(function() {
        document.getElementById('hf_monitor_div')
          .innerHTML = temp1;
        setTimeout(function() {
          document.getElementById('hf_monitor_div')
            .innerHTML += '<br>Final: ' + span.offsetWidth;
        }, 1000);
      });
    }

  };
};

(function(window, document, exportName, undefined) {
  'use strict';

	if (typeof define == TYPE_FUNCTION && define.amd) {
	    define(function() {
	        return Hammer;
	    });
	} else if (typeof module != 'undefined' && module.exports) {
	    module.exports = Hammer;
	} else {
	    window[exportName] = Hammer;
	}

})(window, document, 'Hammer');
