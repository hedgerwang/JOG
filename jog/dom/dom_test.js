/**
 * @fileOverview Tests for dom.
 * @author Hedger Wang
 */

var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;
var dom = require('jog/dom').dom;


(new TestCase('dom'))
  .test('createElement',
  function() {
    var el = dom.createElement('div', {className: 'foo'});
    asserts.notNull(el);
    asserts.equal(el.tagName, 'DIV');
    asserts.equal(el.className, 'foo');
  })
  .test('createElement more',
  function() {
    var mockUI = {
      getNode:function() {
        return document.createTextNode('x')
      }
    };

    var el = dom.createElement('div', null,
      'divText',
      ['span', null, 'spanText'],
      123,
      document.createTextNode('abc'),
      mockUI
    );
    asserts.equal(el.innerHTML, 'divText<span>spanText</span>123abcx');
  });