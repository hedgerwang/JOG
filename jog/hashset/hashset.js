/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var HashCode = require('jog/hashcode').HashCode;

var HashSet = Class.create(null, {
  main: function() {
    this._data = {};
  },

  dispose: function() {
    this.removeAll();
  },

  /**
   * @param {*} key
   */
  add: function(key) {
    var hash = HashCode.getHashCode(key);
    if (!(hash in this._data)) {
      this._size++;
      this._data[hash] = key;
    }
  },

  /**
   * @param {*} obj
   */
  remove: function(obj) {
    var hash = HashCode.getHashCode(obj);
    if (hash in this._data) {
      this._size--;
      delete this._data[hash];
    }
  },

  removeAll: function() {
    for (var key in this._data) {
      delete this._data[key];
    }
    this._size = 0;
  },


  /**
   * @param {*} key
   */
  contains: function(key) {
    var hash = HashCode.getHashCode(key);
    return hash in this._data;
  },

  /**
   * @return {number}
   */
  getSize: function() {
    return this._size;
  },

  _size: 0,
  _data: null
});

exports.HashSet = HashSet;