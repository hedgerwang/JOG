/**
 * @fileOverview objects Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/objects/objects_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('objects Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });