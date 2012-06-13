/**
 * @fileOverview MyTextBox Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/example/mytextbox/mytextbox_test.html
 */

var MyTextBox = require('jog/example/mytextbox').MyTextBox;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('MyTextBox Test'))
  .demo('demo',
  function(body) {
    var obj = new MyTextBox('Hello: ');
    obj.render(body);
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });