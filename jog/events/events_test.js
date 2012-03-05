/**
 * @fileOverview Tests for Events
 * @author Hedger Wang
 */

var Events = require('jog/events').Events;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var dom = require('jog/dom').dom;

(new TestCase('Events'))
  .test('listen Node',
  function() {
    var events = new Events();
    var called = 0;
    var target = dom.createElement('button', null, 'test');
    var fn = function(event) {
      called++;
      this.innerHTML = 'clicked';
      asserts.equal(this, target);
      asserts.equal(event.target, target);
    };
    events.listen(target, 'click', fn);
    dom.prependChild(target, document.body);
    target.click();
    asserts.equal(called, 1);

    events.unlisten(target, 'click', fn);
    target.click();
    asserts.equal(called, 1);
  })
  .test('listen EventTarget', function() {
    var events = new Events();
    var called = 0;
    var target = new EventTarget();
    var fn = function(event) {
      called++;
      asserts.equal(this, target);
      asserts.equal(event.target, target);
    };
    events.listen(target, 'foo', fn);
    target.dispatchEvent('foo');
    asserts.equal(called, 1);

    events.unlisten(target, 'foo', fn);
    target.dispatchEvent('foo');
    asserts.equal(called, 1);
  })
  .test('unlistenAll',
  function() {
    var events = new Events();
    var called = 0;
    var target = new EventTarget();
    var fn = function(event) {
      called++;
    };
    events.listen(target, 'foo', fn);
    events.unlistenAll();
    target.dispatchEvent('foo');
    asserts.equal(called, 0);
  })
  .test('dispose',
  function() {
    var events = new Events();
    var called = 0;
    var target = new EventTarget();
    var fn = function(event) {
      called++;
    };
    events.listen(target, 'foo', fn);
    events.dispose();
    target.dispatchEvent('foo');
    asserts.equal(called, 0);
  });