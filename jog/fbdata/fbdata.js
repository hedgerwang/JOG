/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;
var FBAPI = require('jog/fbapi').FBAPI;
var LocalStorage = require('jog/localstorage').LocalStorage;
var UserAgent = require('jog/useragent').UserAgent;

var CACHE_DURATION = 24 * 60 * 60 * 1000;

if (__DEV__) {
  CACHE_DURATION = 5 * 60 * 60 * 1000;
}

// See https://our.intern.facebook.com/intern/graphiql
// Available Photos Sizes.
// - type(photo){fields{name,calls{name,args{allowed_values}}}}
// "75","130","180","320","480","720","960","2048"

var FBData = {
  /**
   * @param {number} uid
   * @param {number} count
   * @param {string?} cursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getHomeStories: function(uid, count, cursor, useCache) {
    var px = UserAgent.IS_ANDROID ? 180 : 720;
    var query =
      (uid ? 'node(' + parseInt(uid, 10) + ')' : 'me()') +
        '{id,name,home_stories' +
        (cursor ? '.after(' + cursor + ')' : '') +
        '.first(' + count + '){' +
        'nodes{' +
        'feedback{id,comments{count},likers{count}},' +
        'title,id,url,creation_time,actors{' +
        'profile_picture,name,id},' +
        'attachments{' +
        'title,url,media{image.size(' + px + '){uri,width,height},url,id},' +
        'subattachments{media{image.size(' + px + '){uri,width,height}}}},' +
        'message{text}},' +
        'page_info{start_cursor,end_cursor,has_next_page,has_previous_page},' +
        'count}' +
        '}';

    return queryGraph(query, useCache);
  },

  /**
   * @see http://fburl.com/getFeedbacks
   * @param {string} feedbackID
   * @param {number=} count
   * @param {string=} cursor
   * @param {boolean=} useCache
   * @return {Deferred}
   */
  getFeedbacks: function(feedbackID, count, cursor, useCache) {
    var query = 'node(' + feedbackID + '){' +
      'comments' +
      (cursor ? '.after(' + cursor + ')' : '') +
      '.first(' + count + '){' +
      'nodes{body{text},author{' +
      'profile_picture{height,uri,width},id,name},created_time},' +
      'count,page_info}}';
    return queryGraph(query, useCache);
  },

  /**
   * @param {number} uid
   * @param {number} count
   * @param {string?} cursor
   * @return {Deferred}
   */
  getHomeStoriesPageInfo: function(uid, count, cursor) {
    var query =
      (uid ? 'node(' + parseInt(uid, 10) + ')' : 'me()') +
        '{id,name,home_stories' +
        (cursor ? '.before(' + cursor + ')' : '') +
        '.first(' + count + ')' +
        '{page_info{' +
        'start_cursor,end_cursor,has_next_page,has_previous_page},' +
        'count,nodes{id,creation_time}}}';

    return queryGraph(query, false);
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
      '{id,name,username,profile_picture.size(100,100){uri},' +
      'mutual_friends.first(6){nodes{profile_picture.size(80,80){uri},id}},' +
      'albums.first(1){nodes{id,cover_photo{image{uri}}}}}';
    return queryGraph(query, useCache);
  },

  /**
   * @param {number} uid
   * @param {number} count
   * @param {string?} cursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getAlbums: function(uid, count, cursor, useCache) {
    var query = (uid ? 'node(' + uid + ')' : 'me()') +
      '{albums.first(' + count + '){' +
      'nodes{cover_photo{image.size(75){uri}}}}}';
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
      'nodes{id,name,profile_picture{uri}}}}';

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
  },


  /**
   * @see http://fburl.com/3472625
   * @param {boolean} useCache
   */
  getTimelineSections: function(useCache) {
    var px = UserAgent.IS_ANDROID ? 180 : 480;
    var query = 'me()' +
      '{id,timeline_sections.first(5)' +
      '{nodes{label,timeline_units.first(5)' +
      '{nodes{story{message{text},attachments{media{image.size(' + px + ')' +
      '{uri},message{text}}},actors{id,name,profile_picture{uri}}}}}}}}';

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

  useCache = false;

  var saveToCache = function(result) {
    if (!result.error) {
      result._cacheTime = Date.now();
      result._query = query;
      LocalStorage.setItem(query, result);
    }
    query = null;
  };

  if (useCache) {
    LocalStorage.getItem(query).addCallback(function(result) {
      if (result && ((Date.now() - result._cacheTime) < CACHE_DURATION)) {
        df.succeed(result);
      } else {
        df.attachTo(FBAPI.queryGraph(query)).addCallback(saveToCache);
      }
    });
  } else {
    df.attachTo(FBAPI.queryGraph(query)).addCallback(saveToCache);
  }

  return df;
}

exports.FBData = FBData;
