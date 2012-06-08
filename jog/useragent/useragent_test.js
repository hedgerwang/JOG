/**
 * @fileOverview UserAgent Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/useragent/useragent_test.html
 */

var TestCase = require('jog/testing').TestCase;
var UserAgent = require('jog/useragent').UserAgent;
var asserts = require('jog/asserts').asserts;

(new TestCase('UserAgent Test'))
  .demo('demo',
  function(body){
    // var obj = new UserAgent();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });