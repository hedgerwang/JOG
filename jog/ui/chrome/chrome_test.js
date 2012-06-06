/**
 * @fileOverview Chrome Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/app/ui/chrome/chrome_test.html
 */

var Chrome = require('jog/ui/chrome').Chrome;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('Chrome Test'))
  .test('Chrome DEMO',
  function() {
    var chrome = new Chrome();
    chrome.render(document.body);
  });