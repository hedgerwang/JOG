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
   * @param {number} count
   * @param {string?} startCursor
   * @param {boolean} useCache
   * @return {Deferred}
   */
  getHomeStories: function(count, startCursor, useCache) {
    var query = 'me(){id,name,home_stories' +
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
