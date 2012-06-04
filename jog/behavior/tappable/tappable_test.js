/**
 * @fileOverview Tappable Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/behavior/tappable/tappable_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var Tappable = require('jog/behavior/tappable').Tappable;

(new TestCase('Tappable Test'))
  .demo('demo',
  function(body){
    // var obj = new Tappable();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });