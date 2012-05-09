/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var Class = require('/jog/class').Class;
var Disposable = require('/jog/disposable').Disposable;
var dom = require('/jog/dom').dom;

var BaseUI = Class.create({
  extend: Disposable,

  /**
   * @constructor
   */
  construct: function() {
    /**
     * @type {Node}
     * @private
     */
    this._node = null;
  },

  members : {
    /**
     * @override
     */
    disposeInternal : function() {
      this.unlistenAll();
      delete this._eventsHandlers;
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
    }
  }
});


exports.BaseUI = BaseUI;