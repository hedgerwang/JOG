/**
 * @fileOverview Deferred Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/deferred/deferred_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var Deferred = require('jog/deferred').Deferred;
var meta = {};
var delay = 100;
var delayLong = 600;

(new TestCase('Deferred Test'))
  .test('wait succeed',
  function() {
    meta = {value: 0};
    (new Deferred()).
      addCallback(
      function(value) {
        meta.value += value;
      }).
      addCallback(
      function(value) {
        meta.value += value;
      }).
      succeed(1);
  })
  .wait(delay)
  .test('succeed',
  function() {
    asserts.equal(meta.value, 2);
    meta = null;
  })
  .test('wait fail',
  function() {
    meta = {value : 0};
    (new Deferred()).
      addCallback(null,
      function(value) {
        meta.value += value;
      }).addCallback(null,
      function(value) {
        meta.value += value;
      }).
      fail(1);
  })
  .wait(delay)
  .test('fail',
  function() {
    asserts.equal(meta.value, 2);
    meta = null;
  })
  .test('waitForValue',
  function() {
    var obj = {};
    meta = {};
    (new Deferred()).
      waitForValue(obj, 'x').
      waitForValue(obj, 'y').
      addCallback(function(x, y) {
        meta.value = x + '-' + y;
      });

    setTimeout(function() {
      obj.x = 1;
    }, 1);

    setTimeout(function() {
      obj.y = 2;
    }, 2);
  })
  .wait(delayLong)
  .test('waitForValue',
  function() {
    asserts.equal(meta.value, '1-2');
    meta = null;
  })
  .test('wait attachTo',
  function() {
    meta = {};
    (new Deferred()).addCallback(
      function(a, b) {
        meta.value = a + '-' + b;
      })
      .attachTo(new Deferred())
      .attachTo(new Deferred())
      .succeed(1, 2);
  })
  .wait(delay)
  .test('attachTo',
  function() {
    asserts.equal(meta.value, '1-2');
    meta = null;
  })
  .test('wait then',
  function() {
    meta = {};
    var df = new Deferred();
    df.waitForValue(document, 'body')
      .then(
      function(body) {
        var dd = new Deferred();
        dd.succeed(123);
        return dd;
      }).then(
      function(num) {
        var dd = new Deferred();
        dd.succeed('test', num);
        return dd;
      }).addCallback(
      function(a, b) {
        meta.value = a + '-' + b;
      });
  })
  .wait(delay)
  .test('then',
  function() {
    asserts.equal('test-123', meta.value);
    meta = null;
  });