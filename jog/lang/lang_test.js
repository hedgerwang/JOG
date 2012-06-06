/**
 * @fileOverview lang Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/lang/lang_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var lang = require('jog/lang').lang;

(new TestCase('lang Test'))
  .test('bind 1',
  function() {
    var context = {x : 0};

    var fn = lang.bind(context, function() {
      'x' in this ? this.x++ : void 0;
    });

    fn();
    asserts.equal(context.x, 1);
  })
  .test('bind 2',
  function() {
    var context = {x : 0};

    var fn = lang.bind(context, function() {
      'x' in this ? this.x++ : void 0;
    });

    var fn2 = lang.bind(context, fn);
    fn();
    fn2();

    asserts.equal(context.x, 2);

  })
  .test('bind 3',
  function() {
    var context = {x : 0};

    var fn = lang.bind(context, function() {
      'x' in this ? this.x++ : void 0;
    });

    var fn2 = lang.bind(context, fn);

    asserts.throws(function() {
      lang.bind({y: 1}, fn2);
    });
  });