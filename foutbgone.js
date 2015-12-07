/* global define, module */
'use strict';

var FoutBGone = function () {
  /**
   * How often (in ms) to check if test node has been styled
   * @type {Number}
   */
  var testFrequency = 20;

  /**
   * Time (in ms) before it stops checking for fonts to load
   * @type {Number}
   */
  var giveup = 3000;

  /**
   * Enum for possible when states
   * @enum {String}
   */
  var whenStates = {
    ASAP: 'asap',
    ONLOAD: 'onload'
  };

  /**
   * Wrapper function that adds event listener for window onload event with
   * fallback to attachEvent.
   * @param {Function} callback
   */
  var addOnLoadEventListener = function (callback) {
    if (window.addEventListener) {
      window.addEventListener('load', callback, false);
    } else {
      window.attachEvent('onload', callback);
    }
  };

  var getFontNameFromCssRule = function (rule) {
    var regex = /([\s\S]*)(font-family:\s*['"]?)([-_0-9a-zA-Z]+)([\s\S]*)/;
    return rule.replace(regex, '$s3');
  };

  // var getSelectors

  /**
   * Inventories custom fonts used on a page and selectively hides only DOM
   * elements that would cause flash-of-unstyled-text (FOUT).
   * @param  {whenStates} when - One from the possible enumeration whenState
   *                           values whichs tells when hidden content will
   *                           evert to visible (optimum varies by page and
   *                           browser).
   * @param  {Number} [delay=100] - Time between test node being detected as
   *                              styled and hidden nodes being exposed.
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
      if (!stylesheet.cssRules) {
        isCompliant = false;

        var fontFaceReplacer = function (matchedSubString, t) {
          var fontname = getFontNameFromCssRule(matchedSubString);
          fontnames.push(fontname);
          return matchedSubString;
        };

        stylesheet.cssText.replace(/@font-face\s*\{([^\}]+)\}/ig, fontFaceReplacer);
      }

      // cssRules - FF, rules - IE
      var fontFaceRules = stylesheet.cssRules || stylesheet.rules;

      for (var j = 0, ll = fontFaceRules.length; j < ll; j++) {
        var rule = fontFaceRules[j];

        if (isCompliant && rule instanceof CSSFontFaceRule) {
          var fontname = getFontNameFromCssRule(rule.cssText);
          fontnames.push(fontname);
        } else {
          // CSSStyleRule
          fontRules.push(rule);
        }
      }
    }

    // make a list of all style rules that use a custom font
    for (var i = 0; i < fontnames.length; i++) {
      var fontname = fontnames[i];

      for (var j = 0; j < fontRules.length; j++) {
        var fontRule = fontRules[j];
        var csstxt = isCompliant ? fontRule.cssText : fontRule.style.cssText;

        if (csstxt.indexOf(fontname) > -1) {
          selectors.push(fontRule.selectorText);
        }
      }
    }

    // create a span node to be used for measuring default-font-styled vs
    // custom-font-styled
    // Note: the span technique is modeled after code developed by Paul Irish
    // Reference: http://paulirish.com/2009/font-face-feature-detection
    var span = document.createElement('span');
    span.setAttribute('style', 'font:99px _,serif;position:absolute;visibility:hidden');
    // fixes ie7 text flashing bug
    span.style.visibility = 'hidden';
    span.innerHTML = '-------';
    span.id = 'fonttest';

    var body = document.body || document.documentElement;
    body.appendChild(span);

    // moved further down; even though innerHTML was already set above, this is too early for IE
    // var wid = span.offsetWidth;

    // create a new stylesheet to store new classes with visibility:hidden for
    // all nodes with custom fonts
    var stl1 = document.createElement('style');

    // combine all selectors and add visibility hidden to them
    var allhidden = '';
    for (var i = 0, l = selectors.length; i < l; i++) {
      var seperator = i < (l - 1) ? ', ' : ' ';
      allhidden += selectors[i] + seperator;
    }
    allhidden += '{visibility:hidden}';

    // IE8, IE7
    if (stl1.styleSheet) {
      stl1.styleSheet.cssText = allhidden;
    // FF3
    } else {
      stl1.textContent = allhidden;
    }

    // apply custom font to test node, e.g., 'URWGroteskT_LigNar'
    span.style.font = '99px "' + fontnames[fontnames.length - 1] + '",_,serif';

    document.getElementsByTagName('head')[0].appendChild(stl1);

    // at this time, tests in newer browsers (not IE7/IE8) show this as still
    // the width of the original default-font
    var wid = span.offsetWidth;

    var showHidden = function () {
      var fnttest = setInterval(function () {
        // for the benefit of IE7 and IE8
        if (!wid && document.body) {
          body.removeChild(span);
          document.body.appendChild(span);
          wid = span.offsetWidth;
        }

        var nu_wid = span.offsetWidth;
        giveup -= testFrequency;

        if (wid !== nu_wid || giveup <= 0) {
          clearInterval(fnttest);

          setTimeout(function () {
						// unhide fout affected DOM nodes
            stl1.parentNode.removeChild(stl1);
          }, delay);

          // remove the span node
          span.parentNode.removeChild(span);
        }
      }, testFrequency);
    };

    if (when === whenStates.ONLOAD) {
      addOnLoadEventListener(showHidden);
    } else {
      showHidden();
    }
  };
};

if (typeof define === 'function' && define.amd) {
  define(function () {
    return FoutBGone;
  });
} else if (typeof module !== 'undefined' && module.exports) {
  module.exports = FoutBGone;
} else {
  window.FoutBGone = FoutBGone;
}
