/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var uaString = window.navigator.userAgent;
var androidVersion = uaString.match(/Android (\d\.\d\.\d)+/);
androidVersion = androidVersion ? parseFloat(androidVersion[1]) : 0;

var UserAgent = {
  IS_ANDROID: /Android/.test(uaString),
  IS_OLD_ANDROID: androidVersion < 4 && androidVersion > 0,
  IS_IOS: /iPhone|iPad|iPod/.test(uaString)
};

exports.UserAgent = UserAgent;