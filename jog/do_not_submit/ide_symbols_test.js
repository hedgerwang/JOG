/**
 * @fileOverview jog/do_not_submit/ide_symbols.js Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/do_not_submit/ide_symbols_test.html
 */

var TestCase = require('/jog/testing').TestCase;
var asserts = require('/jog/asserts').asserts;

(new TestCase('jog/do_not_submit/ide_symbols.js Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  })