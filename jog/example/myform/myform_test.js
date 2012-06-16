/**
 * @fileOverview MyForm Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/example/myform/myform_test.html
 */

var Events = require('jog/events').Events;
var MyButton = require('jog/example/mybutton').MyButton;
var MyForm = require('jog/example/myform').MyForm;
var MyTextBox = require('jog/example/mytextbox').MyTextBox;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('MyForm Test'))
  .demo('demo',
  function(body) {
    var form = new MyForm();

    var text = new MyTextBox('search');
    form.appendChild(text, true);
    form.render(body);

    var submit = new MyButton('Send', 'submit');
    form.appendChild(submit, true);

//    form.addEventListener('submit', function() {
//      alert(text.getValue());
//    });


    var events = new Events({
      name: 'hedger'
    });

    events.listen(document, 'click', function(e) {
      alert(this.name + e.type);
    });

    events.listen(form, 'submit', function(e) {
      alert(this.name + e.type);
      events.dispose();
    });
  });
