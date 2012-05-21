/**
 * @fileOverview jog/ui/scrollarea/scrollarea.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/scrollarea/scrollarea_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var ScrollArea = require('jog/ui/scrollarea').ScrollArea;

(new TestCase('jog/ui/scrollarea/scrollarea.js Test'))
  .demo('demo',
  function(body) {
    var ui = new ScrollArea();
    ui.render(body);
  });