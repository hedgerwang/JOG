/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;
var FBAPI = require('jog/fbapi').FBAPI;
var LocalStorage = require('jog/localstorage').LocalStorage;

var CACHE_DURATION = 30 * 60 * 1000;

// See https://our.intern.facebook.com/intern/graphiql
var FBData = {
  /**
   * @param {number} uid
   * @param {number} count
   * @param {string?} startCursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getHomeStories: function(uid, count, startCursor, useCache) {
    var query =
      (uid ? 'node(' + parseInt(uid, 10) + ')' : 'me()') +
        '{id,name,home_stories' +
        (startCursor ? '.after(' + startCursor + ')' : '') +
        '.first(' + count + '){' +
        'nodes{title,id,url,creation_time,actors{' +
        'profile_picture,name,id},' +
        'attachments{title,url,media{image{uri,width,height},url,id},' +
        'subattachments{media{image{uri,width,height}}}},' +
        'message{text}},' +
        'page_info{start_cursor,end_cursor,has_next_page,has_previous_page},' +
        'count}' +
        '}';

    console.log(query);

    return queryGraph(query, useCache);
  },

  /**
   * @param {number} uid
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getProfile: function(uid, useCache) {
    var query = (uid ? 'node(' + uid + ')' : 'me()') +
      '{id,name,profile_picture}';
    return queryGraph(query, useCache);
  },

  /**
   * @param {number} uid
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getLargeProfile: function(uid, useCache) {
    var query = (uid ? 'node(' + uid + ')' : 'me()') +
      '{id,name,profile_picture.size(320,320){uri},username,birthday}';
    return queryGraph(query, useCache);
  },

  /**
   * @param {number} count
   * @param {string?} startCursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getFriends: function(count, startCursor, useCache) {
    var query = 'me(){id,friends' +
      '.orderby(importance)' +
      (startCursor ? '.after(' + startCursor + ')' : '') +
      '.first(' + count + '){' +
      'nodes{name,profile_picture{uri}}}}';

    return queryGraph(query, useCache);
  },

  /**
   * @param {number} count
   * @param {string?} startCursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getGroups: function(count, startCursor, useCache) {
    var query = 'me(){id,groups' +
      (startCursor ? '.after(' + startCursor + ')' : '') +
      '.first(' + count + '){' +
      'count,page_info{start_cursor,end_cursor,has_next_page},' +
      'nodes{name,profile_picture,id,url}}}';
    return queryGraph(query, useCache);
  },

  /**
   * @param {number} count
   * @param {string?} startCursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getFriendsList: function(count, startCursor, useCache) {
    var query = 'me(){id,friend_lists' +
      (startCursor ? '.after(' + startCursor + ')' : '') +
      '.first(' + count + '){' +
      'page_info{start_cursor,end_cursor,has_next_page},nodes{name,id,url}}}';
    return queryGraph(query, useCache);
  }
};


/**
 * @param {string} query
 * @param {boolean} useCache
 * @return {Deferred}
 */
function queryGraph(query, useCache) {
  var df = new Deferred();

  LocalStorage.getItem(query).addCallback(function(result) {
    if (useCache &&
      result &&
      ((Date.now() - result._cacheTime) < CACHE_DURATION)) {
      df.succeed(result);
    } else {
      df.attachTo(FBAPI.queryGraph(query)).addCallback(function(result) {
        if (!result.error) {
          result._cacheTime = Date.now();
          LocalStorage.setItem(query, result);
        }
        query = null;
      });
    }
  });

  return df;
}

exports.FBData = FBData;
