/**
 * @fileOverview MyButton Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/example/mybutton/mybutton_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var MyButton = require('jog/example/mybutton').MyButton;

(new TestCase('MyButton Test'))
  .demo('demo',
  function(body) {
    var obj = new MyButton();
    obj.render(body);
  });