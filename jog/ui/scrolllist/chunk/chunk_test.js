/**
 * @fileOverview Chunk Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/scrolllist/chunk/chunk_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Item Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });