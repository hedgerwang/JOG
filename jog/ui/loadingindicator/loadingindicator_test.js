/**
 * @fileOverview LoadingIndicator Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/ui/loadingindicator/loadingindicator_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var LoadingIndicator = require('jog/ui/loadingindicator').LoadingIndicator;

(new TestCase('LoadingIndicator Test'))
  .demo('demo',
  function(body) {
    var obj = new LoadingIndicator();
    obj.render(body);
  });