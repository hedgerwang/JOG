/**
 * @fileOverview BaseUI Test
 * @author Hedger Wang
 *
 * @link http://localhost:8888/jog/ui/baseui/baseui_test.html
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var TestCase = require('jog/testing').TestCase;
var asserts = require('jog/asserts').asserts;

(new TestCase('BaseUI Test'))
  .test('test render',
  function() {
    var ui = new BaseUI();
    asserts.isFalse(ui.isInDocument());
    ui.render(document.body);
    asserts.isTrue(ui.isInDocument());
  })
  .test('test DOM appendChild',
  function() {
    var ui = new BaseUI();
    asserts.isFalse(ui.isInDocument());

    asserts.throws(function() {
      document.body.appendChild(ui.getNode());
    });

    asserts.isFalse(ui.isInDocument());
  })
  .test('test render by Parent',
  function() {
    var parent = new BaseUI();
    var child = new BaseUI();
    parent.appendChild(child, true);
    parent.render(document.body);
    asserts.isTrue(parent.isInDocument());
    asserts.isTrue(child.isInDocument());
  })
  .test('test DOM appendChild from parent',
  function() {
    var parent = new BaseUI();
    var child = new BaseUI();
    parent.appendChild(child, true);

    asserts.throws(function() {
      document.body.appendChild(parent.getNode());
    });

    asserts.isFalse(parent.isInDocument());
    asserts.isFalse(child.isInDocument());
  })
  .test('test UI appendChild',
  function() {
    var parent = new BaseUI();
    var child = new BaseUI();
    parent.render(document.body);
    asserts.isTrue(parent.isInDocument());
    parent.appendChild(child, true);
    asserts.isTrue(child.isInDocument());
  }).
  test('Late render',
  function() {
    var parent = new BaseUI();
    var child = new BaseUI();
    parent.appendChild(child);
    parent.render(document.body);
    asserts.isFalse(child.isInDocument());
    child.render(document.body);
    asserts.isTrue(child.isInDocument());
  })
  .test('remove child',
  function() {
    var parent = new BaseUI();
    var child = new BaseUI();
    parent.appendChild(child, true);
    asserts.isFalse(child.isInDocument());
    parent.render(document.body);
    asserts.isTrue(child.isInDocument());
    parent.removeChild(child);
    asserts.isTrue(child.isInDocument());
  });