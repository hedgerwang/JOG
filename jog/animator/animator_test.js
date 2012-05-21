/**
 * @fileOverview jog/animator/animator.js Test
 * @author Hedger Wang
 *
 * @url http://localhost:8888/jog/animator/animator_test.html
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var Animator = require('jog/animator').Animator;

(new TestCase('jog/animator/animator.js Test'))
  .demo('demo 1',
  function(body) {
    var el = document.createElement('div');
    body.appendChild(el);

    var anim = new Animator();
    anim.start(
      function(value) {
        el.textContent = ~~(value * 100);
      },
      function(value) {
        return value < 0.5;
      },
      function() {
        el.textContent = 'pooh';
      },
      2000);
  });