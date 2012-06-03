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
   * @return {Deferred}
   */
  getHomeStories: function() {
    var query = 'me(){id,name,home_stories.first(70){' +
      'nodes{title,id,url,creation_time,actors{' +
      'profile_picture,name,id},attachments{' +
      'title,url,media{image,url,id}},message{text}}}}';

    return queryGraph(query);
  }
};


/**
 * @param {string} query
 * @return {Deferred}
 */
function queryGraph(query) {
  var df = new Deferred();

  LocalStorage.getItem(query).addCallback(function(result) {
    if (result && ((Date.now() - result._cacheTime) < CACHE_DURATION)) {
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
