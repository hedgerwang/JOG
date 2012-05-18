/**
 * @fileOverview Deferred Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/deferred/deferred_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Deferred Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });