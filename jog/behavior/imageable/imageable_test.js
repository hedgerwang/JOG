/**
 * @fileOverview Imageable Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/behavior/imageable/imageable_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

var Imageable = require('jog/behavior/imageable').Imageable;

(new TestCase('Imageable Test'))
  .demo('demo',
  function(body) {
    var n = 1;
    while (n < 10) {
      var el = document.createElement('div');
      n++;

      if (n > 5) {
        el.style.display = 'none';
        setTimeout(function(el) {
          return function() {
            el.style.display = '';
          }
        }(el), 200 * n);
        el.style.display = 'none';
      }

      el.style.width = el.style.height = n * 10 + 'px';
      el.className = 'imageable';


      body.appendChild(el);
      var imageable = new Imageable(
        el, 'http://graph.facebook.com/4/picture?x' + Math.random()
      );
    }
  });
 