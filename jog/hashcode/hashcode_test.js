/**
 * @fileOverview HashCode Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/hashcode/hashcode_test.html
 */

var TestCase = require('/jog/testing').TestCase;
var asserts = require('/jog/asserts').asserts;

(new TestCase('HashCode Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });