/**
 * @fileOverview
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var HashCode = require('jog/hashcode').HashCode;

var HashMap = Class.create(null, {
  main: function() {
    this._data = {};
  },

  dispose: function() {
    this.clear();
  },

  /**
   * @param {*} key
   * @param {*} value
   */
  set: function(key, value) {
    var hash = HashCode.getHashCode(key);
    if (!(hash in this._data)) {
      this._size++;
    }
    this._data[hash] = value;
  },

  /**
   * @param {*} key
   */
  get: function(key) {
    var hash = HashCode.getHashCode(key);
    return this._data[hash];
  },

  /**
   * @param {*} obj
   */
  unset: function(obj) {
    var hash = HashCode.getHashCode(obj);
    if (hash in this._data) {
      this._size--;
      delete this._data[hash];
    }
  },

  clear: function() {
    for (var key in this._data) {
      delete this._data[key];
    }
    this._size = 0;
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

exports.HashMap = HashMap;