/**
 * @fileOverview cssx Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/cssx/cssx_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('cssx Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });