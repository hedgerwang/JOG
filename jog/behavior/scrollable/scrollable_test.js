/**
 * @fileOverview jog/behavior/scrollable/scrollable.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/behavior/scrollable/scrollable_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var Scrollable = require('jog/behavior/scrollable').Scrollable;
var dom = require('jog/dom').dom;


(new TestCase('jog/behavior/scrollable/scrollable.js Test'))
  .demo('demo',
  function(body) {
    var element = dom.createElement('div', null, ['div']);
    var content = element.lastChild;
    var n = 0;
    while (n < 80) {
      content.appendChild(dom.createElement('div', 'item', 'item ' + n));
      n++;
    }
    body.appendChild(element);
    var scrollable = new Scrollable(element);
  });