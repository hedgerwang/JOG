/**
 * @fileOverview BaseUI Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/ui/baseui/baseui_test.html
 */

var TestCase = require('/jog/testing').TestCase;
var asserts = require('/jog/asserts').asserts;

(new TestCase('BaseUI Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });