/**
 * @fileOverview MyButton Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/example/mybutton/mybutton_test.html
 */

var MyButton = require('jog/example/mybutton').MyButton;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('MyButton Test'))
  .demo('demo',
  function(body) {
    var obj = new MyButton();
    obj.render(body);
  });