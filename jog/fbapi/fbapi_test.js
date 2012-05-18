/**
 * @fileOverview FBAPI Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/fbapi/fbapi_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('FBAPI Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });