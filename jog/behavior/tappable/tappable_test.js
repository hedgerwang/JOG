/**
 * @fileOverview Tappable Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/behavior/tappable/tappable_test.html
 */

var Tappable = require('jog/behavior/tappable').Tappable;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var dom = require('jog/dom').dom;

(new TestCase('Tappable Test'))
  .demo('demo',
  function(body) {
    var btn = document.createElement('button');
    btn.innerHTML = 'tappable';

    var btn1 = btn.cloneNode(true);
    var btn2 = btn.cloneNode(true);

    body.appendChild(btn1);
    body.appendChild(btn2);

    var tappable = new Tappable(body);
    tappable.addTarget(btn1);
    tappable.addTarget(btn2);

    tappable.addEventListener('tap', function(evt) {
      console.log(evt.type, evt.data);
    });

    tappable.addEventListener('tapstart', function(evt) {
      console.log(evt.type, evt.data);
      dom.removeClassName(evt.data, 'selected');
      dom.removeClassName(evt.data, 'dbltapped');
      dom.addClassName(evt.data, 'tapped');
    });

    tappable.addEventListener('tapend', function(evt) {
      console.log(evt.type, evt.data);
      dom.removeClassName(evt.data, 'tapped');
    });

    tappable.addEventListener('dbltap', function(evt) {
      console.log(evt.type, evt.data);
    });

    tappable.addEventListener('tapin', function(evt) {
      console.log(evt.type, evt.data);
      dom.addClassName(evt.data, 'selected');
    });

    tappable.addEventListener('tapout', function(evt) {
      console.log(evt.type, evt.data);
      dom.removeClassName(evt.data, 'selected');
      dom.removeClassName(evt.data, 'dbltapped');
    });

    tappable.addEventListener('dbltap', function(evt) {
      console.log(evt.type, evt.data);
      dom.addClassName(evt.data, 'dbltapped');
    });

  });