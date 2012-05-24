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

  /**
   * @type {Events}
   */
  _mutationEvents: null,

  /**
   * @type {boolean}
   */
  _inDocument: false,

  /** @override */
  dispose : function() {
    if (this._events) {
      this._events.dispose();
    }
    if (this._mutationEvents) {
      this._mutationEvents.dispose();
    }
    dom.remove(this._node);
  },

  /**
   * @return {boolean}
   */
  isInDocument: function() {
    return this._inDocument;
  },

  /**
   * @param {Element} element
   * @param {Node=} opt_nextSibling
   */
  render : function(element, opt_nextSibling) {
    var node = this.getNode();

    if (node.parentNode || this._inDocument) {
      throw new Error('UI has been rendered');
    }

    if (opt_nextSibling) {
      element.insertBefore(node, opt_nextSibling);
    } else {
      element.appendChild(node);
    }

    if (dom.isInDocument(node)) {
      this._inDocument = true;
      this.onDocumentReady();
    } else {
      var targetNode = element;
      if (!dom.isInDocument(targetNode)) {
        targetNode = dom.getDocument().body || dom.getRootNode();
      }
      this._mutationEvents = new Events(this);
      this._mutationEvents.listen(
        targetNode, 'DOMNodeInserted', this._onDOMNodeInserted
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
    if (__DEV__) {
      if (!ui || !(ui instanceof BaseUI)) {
        throw new Error('child must be an instance of BaseUI');
      }
    }
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
    if (!this.disposed && dom.isInDocument(this._node)) {
      this._mutationEvents.dispose();
      delete this._mutationEvents;
      this._inDocument = true;
      this.onDocumentReady();
    }
  }
});

exports.BaseUI = BaseUI;