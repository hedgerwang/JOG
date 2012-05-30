/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;
var FBAPI = require('jog/fbapi').FBAPI;

var FBData = {
  /**
   * @return {Deferred}
   */
  getHomeStories: function() {
    var query = 'me(){home_stories.first(50){' +
      'nodes{message,title,id,url,creation_time,actors,attachments{' +
      'media{src,url,id,message},source,description}}}}';

    return queryGraph(query);
  }
};


/**
 * @param {string} query
 * @return {Deferred}
 */
function queryGraph(query) {
  var df = new Deferred();

  try {
    var data = JSON.parse(localStorage[query]);
    if (!data._cacheTime || (Date.now() - data._cacheTime > 60000)) {
      localStorage.removeItem(query);
      console.warn('FBData cache expired');
    } else {
      return df.succeed(data);
    }
  } catch (ex) {
    //
    console.warn('FBData cache error:' + ex.message);
  }

  df.attachTo(FBAPI.queryGraph(query)).addCallback(function(result) {
    result._cacheTime = Date.now();
    try {
      localStorage[query] = JSON.stringify(result);
    } catch (ex) {
      // Pass
      console.warn('FBData cache read  error:' + ex.message);
    }
    query = null;
  });
  return df;
}


exports.FBData = FBData;
