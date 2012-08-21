/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var uaString = window.navigator.userAgent;
var androidVersion = uaString.match(/Android (\d\.\d\.\d)+/);
androidVersion = androidVersion ? parseFloat(androidVersion[1]) : 0;

var isIOS = /iPhone|iPad|iPod/.test(uaString);
var isIPad = /iPad/.test(uaString);
var isAndroid = /Android/.test(uaString);
var isMobile = isIOS || isAndroid;

var UserAgent = {
  IS_ANDROID: isAndroid,
  IS_IOS: isIOS,
  IS_IOS6: isIOS && !!window.requestAnimationFrame,
  IS_MOBILE: isMobile,
  IS_OLD_ANDROID: androidVersion < 4 && androidVersion > 0,
  IS_IPAD: isIPad,
  IS_DESKTOP: !isMobile,
  USE_TOUCH: 'ontouchstart' in document
};

exports.UserAgent = UserAgent;