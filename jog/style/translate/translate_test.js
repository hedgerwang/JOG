/**
 * @fileOverview translate Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/style/translate/translate_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var translate = require('jog/style/translate').translate;

(new TestCase('translate Test'))
  .demo('demo',
  function(body){
    // var obj = new translate();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });