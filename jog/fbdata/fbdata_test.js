/**
 * @fileOverview FBData Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/fbdata/fbdata_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var FBData = require('jog/fbdata').FBData;

(new TestCase('FBData Test'))
  .test('test',
  function() {
    asserts.equal(1, 1)
  });