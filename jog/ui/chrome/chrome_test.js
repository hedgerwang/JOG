/**
 * @fileOverview Chrome Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/app/ui/chrome/chrome_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var Chrome = require('jog/ui/chrome').Chrome;

(new TestCase('Chrome Test'))
  .test('Chrome DEMO',
  function() {
    var chrome = new Chrome();
    chrome.render(document.body);
  });