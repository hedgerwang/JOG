/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var Functions = require('jog/functions').Functions;
var Imageable = require('jog/behavior/imageable').Imageable;
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
   * @type {boolean}
   */
  _inDocument: false,

  /** @override */
  dispose : function() {
    Class.dispose(this._events);
    dom.remove(this._node);

    if (this._parentUI) {
      this._parentUI.removeChild(this);
    }

    if (this._childrenUI) {
      for (var c = 0, childUI; childUI = this._childrenUI[c]; c++) {
        childUI.dispose();
      }
    }

    if (this._imageables) {
      for (var i = 0, imageable; imageable = this._imageables[i]; i++) {
        imageable.dispose();
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

    delete node._jogBaseUINodeOffDocument;

    if (opt_nextSibling) {
      element.insertBefore(node, opt_nextSibling);
    } else {
      element.appendChild(node);
    }

    this._maybeEnterDocument();
  },

  _maybeEnterDocument: function() {
    if (this._inDocument || !dom.isInDocument(this.getNode())) {
      if (!this._parentUI || !this._parentUI.isInDocument()) {
        return;
      }
    }

    this._inDocument = true;

    this.onDocumentReady();

    if (this._childrenUI) {
      for (var i = 0, child; child = this._childrenUI[i]; i++) {
        child._maybeEnterDocument();
      }
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
      var childrenLength;
      if (__DEV__) {
        childrenLength = this._childrenUI ? this._childrenUI.length : 0;
      }

      this._node = this.createNode();

      if (__DEV__) {
        this._node._jogBaseUINodeOffDocument = true;
        if (this._childrenUI && this._childrenUI.length !== childrenLength) {
          throw new Error('New child appeared to be added while calling ' +
            '#createNode. You should only call #appendChild() after the node ' +
            'has been created.');
        }
      }
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
   * @param {Element} element
   * @param {string} src
   * @param {number=} opt_resizeMode
   * @return {Imageable}
   */
  renderImage: function(element, src, opt_resizeMode) {
    if (!this._imageables) {
      this._imageables = [];
      this._handleImageComplete = this.bind(this._handleImageComplete);
    }

    var imageable = new Imageable(element, src, opt_resizeMode);
    imageable.addEventListener('complete', this._handleImageComplete);
    this._imageables.push(imageable);
    return imageable;
  },

  /**
   * @param {Event} event
   */
  _handleImageComplete: function(event) {
    var imageable = event.target;
    var idx = this._imageables.indexOf(imageable);
    if (idx > 0) {
      this._imageables.splice(idx, 1);
    }
  },

  /**
   * @type {Array.<Imageable>}
   */
  _imageables: null,

  /**
   * Safe to bind events and lookup dom elements.
   */
  onDocumentReady: Functions.EMPTY
});

exports.BaseUI = BaseUI;


// To ensure that an UI instance always uses ui.render(node) instead of
// node.appendChild(ui.getNode());
if (__DEV__) {
  if (typeof Element !== undefined) {
    var appendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(child) {
      if (child._jogBaseUINodeOffDocument) {
        throw new Error(
          'BaseUI node should be added by calling appendChild');
      }
      return appendChild.apply(this, arguments);
    };

    var insertBefore = Element.prototype.insertBefore;
    Element.prototype.insertBefore = function(child) {
      if (child._jogBaseUINodeOffDocument) {
        throw new Error(
          'It appears that you were trying to use ' +
            'element.appendChild(ui.getNode()) to append ui\'s node into this ' +
            'element. You should use ui.render(element) instead.');
      }
      return insertBefore.apply(this, arguments);
    };
  }
}
