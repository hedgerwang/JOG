/**
 * @fileOverview Base Class for UI component.
 * @author Hedger Wang
 */

var dom = require('/jog/dom').dom;

/**
 * @constructor
 */
function BaseUI() {
  /**
   * @type {Node}
   * @private
   */
  this._node = null;
}

/**
 * Dispose itself.
 */
BaseUI.prototype.dispose = function() {
  // No op for now.
};

/**
 * @param {Element} element
 * @param {Node=} opt_nextSibling
 */
BaseUI.prototype.render = function(element, opt_nextSibling) {
  var node = this.getNode();
  if (opt_nextSibling) {
    opt_nextSibling.parentNode.insertBefore(node, opt_nextSibling);
  } else {
    element.appendChild(this.getNode());
  }
};

/**
 * @return {Node}
 */
BaseUI.prototype.getNode = function() {
  if (!this._node) {
    this._node = this.createNode();
  }
  return this._node;
};

/**
 * @return {Node}
 */
BaseUI.prototype.createNode = function() {
  return /** @type {Node} */ (dom.createElement('div'));
};

exports.BaseUI = BaseUI;