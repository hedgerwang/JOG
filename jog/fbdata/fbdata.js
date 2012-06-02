/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;
var FBAPI = require('jog/fbapi').FBAPI;

var CACHE_DURATION = 30 * 60 * 1000;

var FBDataDB = typeof openDatabase === 'function' ?
  openDatabase('FBDataDB', '1.0', 'cache', 2 * 1024 * 1024) :
  null;

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
  },


  /**
   * @param {string} key
   * @param {*} value
   * @return {Deferred}
   */
  saveToDB: function(key, value) {
    var df = new Deferred();
    if (!FBDataDB) {
      df.succeed(false);
    } else {
      FBDataDB.transaction(function(tx) {
        try {
          var type;
          var valueType = typeof value;

          switch (valueType) {
            case 'number':
            case 'string':
              type = valueType;
              break;

            case 'object':
              if (!value) {
                type = 'null';
              } else {
                type = valueType;
                value = JSON.stringify(value)
              }
              break;

            default:
              type = valueType;
              value = String(value);
          }

          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS fb_data_db (key unique, type, value)',
            null,
            function() {
              tx.executeSql(
                'DELETE FROM fb_data_db WHERE key =?',
                [key],
                function() {
                  tx.executeSql('INSERT INTO fb_data_db (key, type, value) ' +
                    'VALUES (?, ?, ?)',
                    [key, type, value],
                    function() {
                      df.succeed(true);
                      df = null;
                    });
                });
            });

        } catch(ex) {
          console.warn('FBDataDBError', ex);
          df.succeed(false);
          df = null;
        }
      });
    }
    return df;
  },

  /**
   * @param {string} key
   * @return {Deferred}
   */
  loadFromDB: function(key) {
    var df = new Deferred();
    if (!FBDataDB) {
      df.succeed(null);
    } else {
      FBDataDB.transaction(function(tx) {
        try {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS fb_data_db (key unique, type, value)',
            null,
            function() {
              tx.executeSql('SELECT * FROM fb_data_db  WHERE key =?',
                [key],
                function(sqlTransaction, sqlResultSet) {
                  var rows = sqlResultSet.rows;
                  if (rows.length === 0) {
                    df.succeed(null);
                  } else {
                    var row = rows.item(0);
                    var value = row.value;
                    switch (row.type) {
                      case 'string':
                        df.succeed(value);
                        break;

                      case 'number':
                        df.succeed(+value);
                        break;

                      case 'null':
                        df.succeed(null);
                        break;

                      case 'object':
                        df.succeed(JSON.parse(value));
                        break;

                      default:
                        df.succeed(value);
                        break;
                    }
                  }
                });
            });
        } catch(ex) {
          console.warn('FBDataDBError', ex);
          df.succeed(null);
          df = null;
        }
      });
    }
    return df;
  }
};


/**
 * @param {string} query
 * @return {Deferred}
 */
function queryGraph(query) {
  var df = new Deferred();

  FBData.loadFromDB(query).addCallback(function(result) {
    if (result && ((Date.now() - result._cacheTime) < CACHE_DURATION)) {
      df.succeed(result);
    } else {
      df.attachTo(FBAPI.queryGraph(query)).addCallback(function(result) {
        if (!result.error) {
          result._cacheTime = Date.now();
          FBData.saveToDB(query, result);
        }
        query = null;
      });
    }
  });

  return df;
}

exports.FBData = FBData;
