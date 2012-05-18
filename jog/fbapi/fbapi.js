/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Deferred = require('jog/deferred').Deferred;
var dom = require('jog/dom').dom;
var objects = require('jog/objects').objects;


var FBAPI = {
  _appID: '328664113867122',

  _fbApi: null,

  _accessToken: null,

  _userID: null,

  _status: null,

  _expiresIn: 0,

  /**
   * @return {Deferred}
   */
  ensureLogin: function() {
    var deferred = new Deferred();

    var timeout = setTimeout(function() {
      deferred.succeed(false);
      timeout = null;
    }, 30000);

    deferred.addCallback(function(result) {
      if (!result) {
        setTimeout(FBAPI._login, 0);
      }
    });

    FBAPI._getApi().addCallback(function(api) {
      api.getLoginStatus(function(response) {
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

        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
          deferred.succeed(!!(FBAPI._accessToken && FBAPI._userID));
        }
      });
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
        api.init({
          'appId': FBAPI._appID,
          'status': true, // check login status
          'cookie': true, // allow the server to access session.
          'xfbml': false // parse XFBML
        });

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

  _login: function() {
    var url = 'https://graph.facebook.com/oauth/authorize' +
      '?client_id=' + FBAPI._appID +
      '&response_type=token' +
      '&redirect_uri=' + top.location.href;
    window.location.replace(url);
  }
};

FBAPI.ensureLogin();

exports.FBAPI = FBAPI;