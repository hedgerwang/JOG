/**
 * @fileOverview TouchHelper Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/touchhelper/touchhelper_test.html
 */

var TestCase = require('jog/testing').TestCase;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var asserts = require('jog/asserts').asserts;

(new TestCase('TouchHelper Test'))
  .demo('demo',
  function(body){
    // var obj = new TouchHelper();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });