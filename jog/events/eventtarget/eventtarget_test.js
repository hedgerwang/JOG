/**
 * @fileOverview Tests for Events.
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/events/eventtarget/eventtarget_test.html
 */

var EventTarget = require('jog/events/eventtarget').EventTarget;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('EventTarget'))
  .test('addEventListener with normal function',
  function() {
    var target = new EventTarget();
    var called = 0;
    var fn = function(event) {
      called++;
      asserts.equal(this, target);
      asserts.equal(event.type, 'foo');
      asserts.equal(event.target, target);
      asserts.equal(event.data, 'xyz');
    };

    target.addEventListener('foo', fn);
    // Duplicated listener should be ignored.
    target.addEventListener('foo', fn);

    target.dispatchEvent('foo', 'xyz');
    asserts.equal(called, 1);

    target.removeEventListener('foo', fn);
    target.dispatchEvent('foo');
    asserts.equal(called, 1);
  })
  .test('addEventListener with Object that has handleEvent',
  function() {
    var target = new EventTarget();
    var obj = {
      called: 0,
      handleEvent : function(event) {
        this.called++;
        asserts.equal(this, obj);
        asserts.equal(event.type, 'foo');
        asserts.equal(event.target, target);
        asserts.equal(event.data, 'xyz');
      }
    };
    target.addEventListener('foo', obj);
    target.dispatchEvent('foo', 'xyz');
    asserts.equal(obj.called, 1);

    target.removeEventListener('foo', obj);
    target.dispatchEvent('foo', 'xyz');
    asserts.equal(obj.called, 1);
  })
  .test('multiple function listeners',
  function() {
    var target = new EventTarget();
    var result = [];

    var fn1 = function() {
      result.push('1');
      target.removeEventListener('foo', fn1);
      target.removeEventListener('foo', fn2);
    };

    var fn2 = function() {
      result.push('2');
      target.removeEventListener('foo', fn1);
      target.removeEventListener('foo', fn2);
    };

    target.addEventListener('foo', fn1);
    target.addEventListener('foo', fn2);
    target.dispatchEvent('foo');
    target.dispatchEvent('foo');
    target.dispatchEvent('foo');
    asserts.equal(result.join(''), '1');
  }).test('use capture',
  function() {
    var target = new EventTarget();
    var called = 0;
    var fn = function(event) {
      called++;
    };

    target.addEventListener('foo', fn, true);
    target.addEventListener('foo', fn, false);
    target.dispatchEvent('foo', 'xyz');
    asserts.equal(called, 2);

    target.removeEventListener('foo', fn, false);
    target.dispatchEvent('foo', 'xyz');
    asserts.equal(called, 3);

    target.removeEventListener('foo', fn, true);
    target.dispatchEvent('foo', 'xyz');
    asserts.equal(called, 3);
  });
