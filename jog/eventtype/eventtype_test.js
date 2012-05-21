/**
 * @fileOverview jog/eventtype/eventtype.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/eventtype/eventtype_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('jog/eventtype/eventtype.js Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });