/**
 * @fileOverview jog/touchhelper/touchhelper.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/touchhelper/touchhelper_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('jog/touchhelper/touchhelper.js Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });