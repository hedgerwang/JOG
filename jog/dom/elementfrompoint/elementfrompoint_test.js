/**
 * @fileOverview elementFromPoint Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/dom/elementfrompoint/elementfrompoint_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var elementFromPoint = require('jog/dom/elementfrompoint').elementFromPoint;

(new TestCase('elementFromPoint Test'))
  .demo('demo',
  function(body) {
    //
  })
  .test('test 1',
  function() {
    var el = document.createElement('div');
    el.className = 'el';
    document.body.appendChild(el);
    window.scrollTo(0, el.offsetTop + 100);

    setTimeout(function() {

      var rect = el.getBoundingClientRect();
      // var el2 = document.elementFromPoint(rect.left + 1 - window.pageXOffset, rect.top + 1 - window.pageYOffset);
      var el2 = document.elementFromPoint(el.offsetLeft + 1, el.offsetTop + 1 - window.pageYOffset);
      el2 = document.elementFromPoint(rect.left + 1, rect.top + 1 - window.pageYOffset);

//    alert([
//      document.elementFromPoint(rect.left + 1, rect.top + 1),
//      document.elementFromPoint(rect.left + 1 - window.pageXOffset, rect.top + 1 - window.pageYOffset),
//      document.elementFromPoint(el.offsetLeft + 1, el.offsetTop),
//      document.elementFromPoint(el.offsetLeft + 1 - window.pageXOffset, el.offsetTop - window.pageYOffset)
//    ]);

      var x = 0;
      var pass = true;
      while (x < 2000 && pass) {
        var y = 0;
        while (y < 2000 && pass) {
          var el2 = document.elementFromPoint(x, y);
          if (el2 === el) {
            pass = false;
            break;
          }
          y++;
        }
        x++;
      }

      // alert([x, y, JSON.stringify(el.getBoundingClientRect()), window.pageYOffset].join('\n'));

      var el2 = document.createElement('div');
      el2.className = 'el2';
      el2.style.left = x + window.pageXOffset + 'px';
      el2.style.top = y + window.pageYOffset + 'px';
      el2.style.position = 'absolute';
      el2.style.background = 'green';
      document.body.appendChild(el2);
    }, 500);

    // asserts.equal(elToTest, el2);
    // window.scrollTo(0, 0);
  });