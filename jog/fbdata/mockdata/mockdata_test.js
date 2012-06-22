/**
 * @fileOverview MockData Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/fbdata/mockdata/mockdata_test.html
 */

var MockData = require('jog/fbdata/mockdata').MockData;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('MockData Test'))
  .demo('demo',
  function(body){
    // var obj = new MockData();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });