/**
 * @fileOverview HasgMap Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/hashmap/hashmap_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var HasgMap = require('jog/hashmap').HashMap;

(new TestCase('HasgMap Test'))
  .test('test hashmap',
  function() {
    var map = new HasgMap();
    var key1 = {};
    var key2 = {};
    var value = 1234;

    asserts.equal(map.getSize(), 0);

    map.set(key1, value);

    asserts.equal(map.getSize(), 1);
    asserts.equal(map.get(key1), value);

    map.unset(key1);
    asserts.equal(map.getSize(), 0);

    map.set(key1, value);
    map.set(key2, value);
    asserts.equal(map.getSize(), 2);

    map.clear();
    asserts.equal(map.getSize(), 0);
  });