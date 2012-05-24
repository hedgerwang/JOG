/**
 * @fileOverview jog/ui/simplescrolllist/simplescrolllist.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/simplescrolllist/simplescrolllist_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var SimpleScrollList = require('jog/ui/simplescrolllist').SimpleScrollList;

(new TestCase('jog/ui/simplescrolllist/simplescrolllist.js Test'))
  .demo('demo',
  function(body) {
    var list = new SimpleScrollList();
    list.render(body);
  });