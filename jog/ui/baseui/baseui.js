/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var Functions = require('jog/functions').Functions;
var Tappable = require('jog/behavior/tappable').Tappable;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;

var BaseUI = Class.create(EventTarget, {
  /**
   * @type {BaseUI}
   */
  _parentUI: null,

  /**
   * @type {Array.<BaseUI>
   */
  _childrenUI: null,

  /**
   * @type {Node}
   */
  _node: null,

  /**
   * @type {Events}
   */
  _events: null,

  /**
   * @type {Tappable}
   */
  _nodeTappable: null,

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
    Class.dispose(this._events);
    Class.dispose(this._mutationEvents);
    dom.remove(this._node);

    if (this._parentUI) {
      this._parentUI.removeChild(this);
    }

    if (this._childrenUI) {
      for (var i = 0, j = this._childrenUI.length; i < j; i++) {
        this._childrenUI[i].dispose();
      }
    }
  },

  /** @override */
  getBubbleTarget: function() {
    return this._parentUI;
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
   * @return {number}
   */
  getWidth: function() {
    return this._node ? this._node.offsetWidth : 0;
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
   * @return {Tappable}
   */
  getNodeTappable: function() {
    if (!this._nodeTappable) {
      this._nodeTappable = new Tappable(this.getNode());
    }
    return this._nodeTappable;
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
   * @param {BaseUI} child
   * @paran {boolean=} opt_render
   */
  appendChild: function(child, opt_render) {
    if (__DEV__) {
      if (!child || !(child instanceof BaseUI)) {
        throw new Error('child must be an instance of BaseUI');
      }

      if (child._parentUI) {
        throw new Error('parent ui exists!');
      }
    }
    child._parentUI = this;

    if (!this._childrenUI) {
      this._childrenUI = [];
    }

    this._childrenUI.push(child);

    if (opt_render) {
      child.render(this.getNode());
    }

    return child;
  },

  /**
   * @param {BaseUI} ui
   */
  removeChild: function(ui) {
    if (__DEV__) {
      if (!ui || !(ui instanceof BaseUI)) {
        throw new Error('child must be an instance of BaseUI');
      }

      if (ui._parentUI !== this) {
        throw new Error('parent ui mismatch');
      }
    }

    ui._parentUI._childrenUI.splice(ui._parentUI._childrenUI.indexOf(ui), 0);
    delete ui._parentUI;
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