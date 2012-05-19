/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var Functions = require('jog/functions').Functions;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;

var BaseUI = Class.create(EventTarget, {

  /**
   * @type {Node}
   */
  _node: null,

  /**
   * @type {Events}
   */
  _events: null,

  /** @override */
  disposeInternal : function() {
    if (this._events) {
      this._events.dispose();
    }
    dom.remove(this._node);
    EventTarget.prototype.disposeInternal.call(this);
  },

  /**
   * @param {Element} element
   * @param {Node=} opt_nextSibling
   */
  render : function(element, opt_nextSibling) {
    var node = this.getNode();

    if (node.parentNode) {
      throw new Error('UI was rendered');
    }

    if (opt_nextSibling) {
      opt_nextSibling.parentNode.insertBefore(node, opt_nextSibling);
    } else {
      element.appendChild(node);
    }

    if (this._inDocument) {
      this.onExitDocument();
    }

    if (dom.isInDocument(node)) {
      this._inDocument = true;
      this.onDocumentReady();
    } else {
      this._onDOMNodeInserted = lang.bind(this, this._onDOMNodeInserted);
      this.getEvents().listen(
        element, 'DOMNodeInserted', this._onDOMNodeInserted
      );
    }
  },

  /**
   * @return {Node}
   */
  getNode : function() {
    if (!this._node) {
      this._node = this.createNode();
    }
    return this._node;
  },

  /**
   * @return {Node}
   */
  createNode : function() {
    return /** @type {Node} */ (dom.createElement('div'));
  },

  /**
   * @return {Events}
   */
  getEvents: function() {
    return this._events || (this._events = new Events(this));
  },

  /**
   * @param {BaseUI} ui
   */
  appendChild: function(ui) {

  },

  /**
   * Safe to bind events and lookup dom elements.
   */
  onDocumentReady: Functions.EMPTY,

  /**
   * Handler for node that enters or exits the document.
   * @param {Event}
    */
  _onDOMNodeInserted: function(event) {
    if (!this.isDisposed() && dom.isInDocument(this._node)) {
      this.getEvents().listen(
        event.currentTarget, 'DOMNodeInserted', this._onDOMNodeInserted
      );
      this.onDocumentReady();
    }
  }
});

exports.BaseUI = BaseUI;