/**
 * @fileOverview FBData Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/fbdata/fbdata_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var FBData = require('jog/fbdata').FBData;

var meta1;
var meta2;

(new TestCase('FBData Test'))
  .test('test DB wait',
  function() {
    meta1 = {
      str : 's' + Math.random(),
      num: Math.random(),
      obj: {
        x: Math.random(),
        y: Math.random()
      }
    };

    var key = 'test_data';

    FBData.saveToDB(key, meta1)
      .addCallback(
      function(value) {
        meta1.value = value;
        FBData.loadFromDB(key).addCallback(function(value) {
          meta2 = value
        });
      });
  })
  .wait(500)
  .test('test DB',
  function() {
    asserts.equal(meta1.value, true);
    asserts.objectEqual(meta1, meta2);
  });