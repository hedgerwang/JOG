/**
 * @fileOverview Functions Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/functions/functions_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Functions Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });