/**
 * @fileOverview Class Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/class/class_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Class Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });