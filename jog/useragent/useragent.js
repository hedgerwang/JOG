/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var uaString = window.navigator.userAgent;

var UserAgent = {
  IS_ANDROID: /Android/.test(uaString)
};

exports.UserAgent = UserAgent;