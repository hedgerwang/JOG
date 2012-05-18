/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Deferred = require('jog/deferred').Deferred;
var ID = require('jog/id').ID;
var dom = require('jog/dom').dom;
var objects = require('jog/objects').objects;

var headNode = dom.getDocument().getElementsByTagName('head')[0];

var FBAPI = {
  _appID: '328664113867122',

  _fbApi: null,

  _initialized: false,

  _accessToken: null,

  _userID: null,

  _status: null,

  _expiresIn: 0,

  /**
   * @type {Object}
   */
  _context: null,

  /**
   * @return {Deferred}
   */
  query: function(query) {
    var deferred = new Deferred();
    var callbackName = ID.next('FBAPI_Callback');

    window[callbackName] = function(response) {
      delete window[callbackName];
      callbackName = null;
      deferred.succeed(response);
      deferred = null;
      script.parentNode.removeChild(script);
      script = null;
    };

    var url = 'https://graph.facebook.com/graphql' +
      '?access_token=' + FBAPI._accessToken +
      '&q=' + encodeURIComponent(query) +
      '&callback=' + callbackName;

    var script = dom.createElement('script', {
      src: url,
      async: 'async',
      defer: 'defer'
    });

    headNode.appendChild(script);
    return deferred;
  },

  /**
   * @return {Deferred}
   */
  isLoggedIn: function() {
    var deferred = new Deferred();
    if (!!(FBAPI._accessToken && FBAPI._userID)) {
      deferred.succeed(true);
    } else {
      FBAPI._updateSession().addCallback(function(result) {
        deferred.succeed(result);
      });
    }
    return deferred;
  },



  /**
   * @return {Deferred}
   */
  ensureSession: function() {
    var deferred = new Deferred();
    FBAPI._updateSession().addCallback(function(result) {
      if (!result) {
        FBAPI._login();
      } else {
        deferred.succeed(true);
      }
    });
    return deferred;
  },


  /**
   * @return {Deferred}
   */
  _getApi: function() {
    var deferred = new Deferred();
    if (FBAPI._fbApi) {
      deferred.succeed(FBAPI._fbApi)
    } else {
      FBAPI._install().addCallback(function() {
        deferred.succeed(FBAPI._fbApi);
        deferred = null;
      });
    }
    return deferred;
  },


  /**
   * @return {Deferred}
   */
  _install: function(body) {
    var deferred = new Deferred();

    (new Deferred()).waitForValue(FBAPI, '_fbApi').addCallback(
      function (api) {
        if (!FBAPI._initialized) {
          FBAPI._initialized = true;
          api.init({
            'appId': FBAPI._appID,
            'status': true, // check login status
            'cookie': true, // allow the server to access session.
            'xfbml': false // parse XFBML
          });
        }

        deferred.succeed(api);
      });


    if (!window.fbAsyncInit) {
      window.fbAsyncInit = function() {
        FBAPI._fbApi = window.FB;
      };
    }

    if (!window._installed) {
      window._installed = true;

      (new Deferred()).waitForValue(dom.getDocument(), 'body').addCallback(
        function(body) {
          var script = dom.createElement('script', {
            src: '//connect.facebook.net/en_US/all.js',
            async: 'async',
            defer: 'defer'
          });

          var el = dom.createElement('div', {
            id: 'fb-root'
          });

          body.insertBefore(el, body.firstChild);
          el.appendChild(script);
        });
    }

    return deferred;
  },

  /**
   * @return {Deferred}
   */
  _updateSession: function() {
    var deferred = new Deferred();

    var timeout = setTimeout(function() {
      if (deferred) {
        deferred.succeed(false);
        timeout = null;
        deferred = null;
      }
    }, 30000);

    FBAPI._getApi().addCallback(function(api) {
      api.getLoginStatus(function(response) {
        if (deferred) {
          FBAPI._accessToken = objects.getValueByName(
            'authResponse.accessToken', response);

          FBAPI._userID = objects.getValueByName(
            'authResponse.userID', response);

          FBAPI._status = objects.getValueByName(
            'status', response);

          // The duration in seconds of the access.
          FBAPI._expiresIn = parseInt(objects.getValueByName(
            'authResponse.expiresIn', response), 10) || 0;

          // Automatically refresh the login status.
          // setTimeout(FBAPI.isLogin, Math.max(5000, FBAPI._expiresIn - 1000));

          clearTimeout(timeout);
          deferred.succeed(!!(FBAPI._accessToken && FBAPI._userID));
          timeout = null;
          deferred = null;
        }
      });
    });

    return deferred;
  },

  _login: function() {
    var url = 'https://graph.facebook.com/oauth/authorize' +
      '?client_id=' + FBAPI._appID +
      '&response_type=token' +
      '&redirect_uri=' + top.location.href;
    window.location.replace(url);
  }
};

FBAPI.ensureSession();

exports.FBAPI = FBAPI;