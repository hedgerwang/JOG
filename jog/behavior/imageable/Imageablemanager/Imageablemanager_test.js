/**
 * @fileOverview ImageableManager Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/behavior/imageable/imageablemanager/imageablemanager_test.html
 */

var ImageableManager = require('jog/behavior/imageable/imageablemanager').ImageableManager;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('ImageableManager Test'))
  .demo('demo',
  function(body){
    // var obj = new ImageableManager();
  })
  .test('test 1',
  function() {
    asserts.equal(1, 1);
  });