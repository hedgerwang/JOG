/**
 * @fileOverview MyTextBox Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/example/mytextbox/mytextbox_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var MyTextBox = require('jog/example/mytextbox').MyTextBox;

(new TestCase('MyTextBox Test'))
  .demo('demo',
  function(body){
    // var obj = new MyTextBox();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });