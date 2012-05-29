/**
 * @fileOverview TestCase Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/testing/testing_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var t1;
var t2;

(new TestCase('TestCase Test'))
  .demo('demo',
  function(body) {
    body.appendChild(document.createTextNode('demo test :-)'));
  })
  .test('test wait 1',
  function() {
    t1 = Date.now();
  })
  .wait(500)
  .test('test wait 2',
  function() {
    t2 = Date.now();
    asserts.isTrue((t2 - t1) >= 500)
  });