/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var dom = require('jog/dom').dom;

var BaseUI = Class.create({
  extend: EventTarget,

  /**
   * @constructor
   */
  construct: function() {
    EventTarget.call(this);
  },

  members : {
    /**
     * @type {Node}
     * @private
     */
    _node: null,

    /**
     * @type {Events}
     * @private
     */
    _events: null,


    /** @override */
    disposeInternal : function() {
      if (this._events) {
        this._events.dispose();
      }
      this.superPrototype.disposeInternal.call(this);
    },

    /**
     * @param {Element} element
     * @param {Node=} opt_nextSibling
     */
    render : function(element, opt_nextSibling) {
      var node = this.getNode();
      if (opt_nextSibling) {
        opt_nextSibling.parentNode.insertBefore(node, opt_nextSibling);
      } else {
        element.appendChild(this.getNode());
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

    }
  }
});

exports.BaseUI = BaseUI;