/**
 * @fileOverview jog/ui/fbui/fbui.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/fbui/fbui_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('jog/ui/fbui/fbui.js Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });