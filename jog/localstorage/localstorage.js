/**
 * @fileOverview
 * @author Hedger Wang
 */

var Deferred = require('jog/deferred').Deferred;

var TABLE_NAME = 'local_storage_db_table_v2';

var dataBase = typeof openDatabase === 'function' ?
  openDatabase('local_storage_db', '1.0', 'cache', 2 * 1024 * 1024) :
  null;

var readOnlyArray = [];

var LocalStorage = {
  /**
   * @param {string} key
   * @param {number|string|boolean|Object} value
   * @return {Deferred}
   */
  setItem: function(key, value) {
    var df = new Deferred();
    if (!dataBase) {
      df.succeed(false);
    } else {
      dataBase.transaction(function(tx) {
        ensureTableExist(tx, function() {
          deleteItem(tx, key, function() {
            insertItem(tx, key, value, function() {
              df.succeed(true);
              trimDB(tx);
            })
          });
        });
      });
    }

    return df;
  },

  /**
   * @param {string} key
   * @return {Deferred}
   */
  getItem: function(key) {
    var df = new Deferred();

    if (!dataBase) {
      df.succeed(null);
    } else {
      dataBase.transaction(function(tx) {
        ensureTableExist(tx, function() {
          selectItem(tx, key, function(value) {
            df.succeed(value);
            // trimDB(tx);
          })
        });
      });
    }
    return df;
  }
};

/**
 * @param {SQLTransaction} sqlTransaction
 * @param {Function} callback
 */
function ensureTableExist(sqlTransaction, callback) {
  sqlTransaction.executeSql(
    'CREATE TABLE IF NOT EXISTS ' + TABLE_NAME +
      ' (key unique, type, value, timestamp)',
    null,
    callback);
}

/**
 * @param {SQLTransaction} sqlTransaction
 * @param {string} key
 * @param {Function} callback
 */
function deleteItem(sqlTransaction, key, callback) {
  readOnlyArray.length = 0;
  readOnlyArray.push(key);

  sqlTransaction.executeSql(
    'DELETE FROM  ' + TABLE_NAME + ' WHERE key =?',
    readOnlyArray,
    callback);
}

/**
 * @param {SQLTransaction} sqlTransaction
 * @param {string} key
 * @param {*} value
 * @param {Function} callback
 */
function insertItem(sqlTransaction, key, value, callback) {
  var type;
  var valueType = typeof value;

  switch (valueType) {
    case 'number':
    case 'boolean':
    case 'string':
      type = valueType;
      break;

    case 'undefined':
      type = 'null';
      value = null;
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
      // undefined
      // function
      // DOM...?
      type = valueType;
      value = String(value);
  }

  readOnlyArray.length = 0;
  readOnlyArray.push(key, type, value, Date.now());

  sqlTransaction.executeSql('INSERT INTO ' + TABLE_NAME +
    ' (key, type, value, timestamp) ' +
    'VALUES (?, ?, ?, ?)',
    readOnlyArray,
    callback);
}

/**
 * @param {SQLTransaction} sqlTransaction
 * @param {string} key
 * @param {Function} callback
 */
function selectItem(sqlTransaction, key, callback) {
  readOnlyArray.length = 0;
  readOnlyArray.push(key);

  sqlTransaction.executeSql('SELECT * FROM ' + TABLE_NAME + ' WHERE key =?',
    readOnlyArray,
    function(sqlTransaction, sqlResultSet) {
      var rows = sqlResultSet.rows;
      if (rows.length === 0) {
        callback(sqlTransaction, null);
      } else {
        var row = rows.item(0);
        var value = row.value;
        switch (row.type) {
          case 'string':
            callback(value);
            break;

          case 'number':
            callback(+value);
            break;

          case 'boolean':
            callback(value === 'true');
            break;

          case 'null':
            callback(null);
            break;

          case 'object':
            callback(JSON.parse(value));
            break;

          default:
            callback(value);
            break;
        }
      }
    });
}

var trimDBCount = 0;

/**
 * @param {SQLTransaction} sqlTransaction
 */
function trimDB(sqlTransaction) {
  trimDBCount++;
  if (trimDBCount > 20) {
    trimDBCount = 0;

    var duration = 3 * 60 * 1000 * 60; // 3 hour.

    sqlTransaction.executeSql(
      'DELETE FROM  ' + TABLE_NAME + ' WHERE timestamp <=' +
        (Date.now() - (duration)));
  }
}

exports.LocalStorage = LocalStorage;