/**
 * @fileOverview Scene Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/scene/scene_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Scene Test'))
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });