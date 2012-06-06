/**
 * @fileOverview HashSet Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/hashset/hashset_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var HashSet = require('jog/hashset').HashSet;

(new TestCase('HashSet Test'))
  .test('test 1',
  function() {
    var set = new HashSet();
    var key1 = {};
    var key2 = {};

    asserts.equal(set.getSize(), 0);

    set.add(key1);
    set.add(key1);
    set.add(key2);

    asserts.equal(set.getSize(), 2);

    set.remove(key1);
    asserts.equal(set.getSize(), 1);

    set.removeAll();
    asserts.equal(set.getSize(), 0);
  });