/**
 * @fileOverview LocalStorage Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/localstorage/localstorage_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var LocalStorage = require('jog/localstorage').LocalStorage;

var meta1;
var meta2;

(new TestCase('LocalStorage Test'))
  .test('test LocalStorage wait',
  function() {
    meta1 = {
      str : 's' + Math.random(),
      num: Math.random(),
      bool_value: true,
      null_value: null,
      undefined_value: undefined,
      obj: {
        x: Math.random(),
        y: Math.random()
      }
    };

    var key = 'test_data';

    LocalStorage.setItem(key, meta1)
      .addCallback(
      function(value) {
        meta1.value = value;
        LocalStorage.getItem(key).addCallback(function(value) {
          meta2 = value
        });
      });
  })
  .wait(500)
  .test('test LocalStorage',
  function() {
    asserts.equal(meta1.value, true);
    asserts.objectEqual(meta1, meta2);
  });