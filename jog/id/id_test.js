/**
 * @fileOverview ID Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/id/id_test.html
 */

var ID = require('jog/id').ID;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('ID Test'))
  .test('next',
  function() {
    var id1 = ID.next();
    var id2 = ID.next();
    asserts.notEmpty(id1);
    asserts.notEmpty(id2);
    asserts.notEqual(id1, id2);
  });