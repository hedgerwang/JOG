/**
 * @fileOverview FBAPI Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/fbapi/fbapi_test.html
 */

var FBAPI = require('jog/fbapi').FBAPI;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('FBAPI Test'))
  .demo('demo',
  function(body){
    // var obj = new FBAPI();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });