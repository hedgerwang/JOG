/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Deferred = require('jog/deferred').Deferred;
var ID = require('jog/id').ID;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;
var objects = require('jog/objects').objects;


var FBAPI = {
  _fbApi: null,

  /**
   * @param {string} query
   * @return {Deferred}
   */
  queryGraph: function(query) {
    var deferred = new Deferred();

    isLoggedIn().addCallback(function(pass) {
      if (!pass) {
        return deferred.fail('not logged in');
      }

      var callbackName = ID.next('FBAPI_callback_');

      window[callbackName] = function(response) {
        delete window[callbackName];
        callbackName = null;
        deferred.succeed(response);
        deferred = null;
        script.parentNode.removeChild(script);
        script = null;
      };

      var url = 'https://graph.facebook.com/graphql' +
        '?access_token=' + accessToken +
        '&q=' + encodeURIComponent(query) +
        '&callback=' + callbackName;

      var script = dom.createElement('script', {
        src: url,
        async: 'async',
        defer: 'defer'
      });

      headNode.appendChild(script);
    });
    return deferred;
  },

  /**
   * @param {string} query
   * @return {Deferred}
   */
  isLoggedIn: function() {
    return isLoggedIn();
  }
};

////////////////////////////////////////////////////////////////////////////////

var headNode = dom.getDocument().getElementsByTagName('head')[0];
var appID = '328664113867122';
var fbAPIInitialized = false;
var scriptInstalled = false;
var accessToken = '';
var userID = 0;
var expiresIn = 0;
var status = '';
var permissions = [
  'create_event',
  'create_note',
  'export_stream',
  'friends_about_me',
  'friends_activities',
  'friends_birthday',
  // 'friends_checkins',
  'friends_education_history',
  'friends_events',
  'friends_groups',
  'friends_hometown',
  'friends_interests',
  'friends_likes',
  'friends_location',
  'friends_notes',
  'friends_online_presence',
  'friends_photo_video_tags',
  'friends_photos',
  'friends_relationship_details',
  'friends_relationships',
  'friends_religion_politics',
  'friends_status',
  'friends_videos',
  'friends_website',
  'friends_work_history',
  'manage_friendlists',
  'manage_notifications',
  'manage_pages',
  'photo_upload',
  'publish_checkins',
  'publish_stream',
  'read_friendlists',
  'read_insights',
  'read_mailbox',
  'read_requests',
  'read_stream',
  'rsvp_event',
  'share_item',
  'status_update',
  'user_about_me',
  'user_activities',
  'user_birthday',
  // 'user_checkins',
  'user_education_history',
  'user_events',
  'user_groups',
  'user_hometown',
  'user_interests',
  'user_likes',
  'user_location',
  'user_notes',
  'user_online_presence',
  'user_photo_video_tags',
  'user_photos',
  'user_relationship_details',
  'user_relationships',
  'user_religion_politics',
  'user_status',
  'user_videos',
  'user_website',
  'user_work_history',
  'video_upload'
];

////////////////////////////////////////////////////////////////////////////////

/**
 * @return {Deferred}
 */
function isLoggedIn() {
  if (!!(accessToken && userID)) {
    return (new Deferred()).succeed(true);
  } else {
    return updateSession();
  }
}

function redirectToLogin() {
  var url = 'https://graph.facebook.com/oauth/authorize' +
    '?client_id=' + appID +
    '&response_type=token' +
    '&redirect_uri=' + top.location.href +
    '&scope=' + permissions.join(',') +
    '&redirect_uri' + encodeURIComponent(top.location.href);

  window.location.replace(url);
}

/**
 * @return {Deferred}
 */
function getApi() {
  if (FBAPI._fbApi) {
    return (new Deferred()).succeed(FBAPI._fbApi);
  } else {
    return installFBApi();
  }
}

/**
 * @return {Deferred}
 */
function installFBApi() {
  var deferred = new Deferred();
  if (!scriptInstalled) {
    scriptInstalled = true;

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

  (new Deferred()).waitForValue(FBAPI, '_fbApi').addCallback(
    function (api) {
      if (!fbAPIInitialized) {
        fbAPIInitialized = true;

        api.init({
          'appId': appID,
          'status': true, // check login status
          'cookie': true, // allow the server to access session.
          'xfbml': false // parse XFBML
        });
      }

      deferred.succeed(api);
    });

  return deferred;
}

/**
 * @return {Deferred}
 */
function updateSession() {
  var deferred = new Deferred();

  var timeout = setTimeout(function() {
    if (deferred) {
      deferred.succeed(false);
      timeout = null;
      deferred = null;
    }
  }, 30000);

  getApi().addCallback(function(api) {
    api.getLoginStatus(function(response) {
      if (deferred) {
        accessToken = objects.getValueByName(
          'authResponse.accessToken', response);

        userID = objects.getValueByName(
          'authResponse.userID', response);

        status = objects.getValueByName(
          'status', response);

        // The duration in seconds of the access.
        expiresIn = parseInt(objects.getValueByName(
          'authResponse.expiresIn', response), 10) || 0;

        // Automatically refresh the login status.
        // setTimeout(FBAPI.isLogin, Math.max(5000, FBAPI._expiresIn - 1000));

        clearTimeout(timeout);
        deferred.succeed(!!(accessToken && userID));
        timeout = null;
        deferred = null;
      }
    });
  });

  return deferred;
}

/**
 * @return {Deferred}
 */
function ensureSession() {
  var deferred = new Deferred();
  updateSession().addCallback(function(result) {
    if (!result) {
      redirectToLogin();
    } else {
      deferred.attachTo(checkPermissions());
    }
  });
  return deferred;
}

/**
 * @return {Deferred}
 */
function checkPermissions() {
  var deferred = new Deferred();
  queryConnect('/me/permissions').addCallback(function(results) {
    var data = results.data;
    if (lang.isArray(data)) {
      var userPermissions = data[0];
      var denied;
      permissions.some(function(key) {
        if (!userPermissions[key]) {
          denied = true;
          return false;
        }
      });
      deferred.succeed(!denied);
    } else {
      deferred.succeed(false);
    }
  });
  return deferred;
}

function queryConnect(path) {
  if (!accessToken) {
    throw new Error('accessToken is null');
  }

  var deferred = new Deferred();

  getApi().addCallback(function(fbApi) {
    var symbol = path.indexOf('?') > -1 ? '&' : '?';
    var accessPath = path + symbol + 'access_token=' + accessToken;
    fbApi.api(accessPath, function(results) {
      results['access_token'] = accessToken;
      deferred.succeed(results);
    });
  });

  return deferred;
}

window.fbAsyncInit = function() {
  FBAPI._fbApi = window.FB;
  delete window.fbAsyncInit;
};

ensureSession();
exports.FBAPI = FBAPI;