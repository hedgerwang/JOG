var __DEV__ = true;
var require;
var define;
var debugLog;
var debugError;

(function() {
  var defines = {};

  require = function(path) {
    var fn = defines[path];
    if (typeof fn != 'object') {
      debugLog(path, fn);
      throw new Error('require error ' + path);
    }
    return fn;
  };

  define = function (path, fn) {
    if (!defines[path]) {
      defines[path] = fn();
      debugLog('define module:', path);
    }
  };

  debugLog = function() {
    if (__DEV__) {
      console.log.apply(console, arguments);
    }
  };

  debugError = function() {
    if (__DEV__) {
      console.error.apply(console, arguments);
    }
  };
})();

