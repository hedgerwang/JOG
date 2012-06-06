/**
 * @fileOverview HashCode Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/hashcode/hashcode_test.html
 */

var HashCode = require('jog/hashcode').HashCode;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('HashCode Test'))
  .test('getHashCode',
  function() {
    var things = [
      null,
      undefined,
      true,
      false,
      1,
      0,
      NaN,
      document,
      window,
      document.createElement('div'),
      function() {

      },
      [123],
      [],
      {x: 123},
      {},
      '',
      'str'
    ];

    var ids = {};

    for (var i = 0; i < things.length; i++) {
      var thing = things[i];
      var id1 = HashCode.getHashCode(thing);
      var id2 = HashCode.getHashCode(thing);
      asserts.equal(id1, id2, thing);
      asserts.notEmpty(id1);
      asserts.isFalse(id1 in ids);
      ids[id1] = true;
    }
  });