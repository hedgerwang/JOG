/**
 * @fileOverview DOM Utilities.
 * @author Hedger Wang
 */

var objectPrototypeToString = Object.prototype.toString;

function DOM(doc) {
  /**
   * @type {Document}
   * @private
   */
  this._document = doc;
}

/**
 *
 * @param {Node} node
 * @param {Node} parentNode
 */
DOM.prototype.prependChild = function(node, parentNode) {
  if (parentNode.firstChild) {
    parentNode.insertBefore(node, parentNode.firstChild);
  } else {
    parentNode.appendChild(node);
  }
};

/**
 *
 * @param {string} tagName
 * @param {Object} properties
 * @param {...*} more
 */
DOM.prototype.createElement = function(tagName, properties, more) {
  var node = this._document.createElement(tagName);
  for (var key in properties) {
    var value = properties[key];
    switch (key) {
      case 'class':
      case 'className':
        node.className = value;
        break;
      case 'style':
        node.style.cssText = value;
        break;
      default:
        node.setAttribute(value);
    }
  }
  if (arguments.length > 2) {
    more = Array.prototype.slice.call(arguments, 2);
    var frag = this._document.createDocumentFragment();
    for (var i = 0, len = more.length; i < len; i++) {
      var obj = more[i];
      if (!obj) {
        continue;
      }
      switch (typeof obj) {
        case 'string':
          frag.appendChild(this._document.createTextNode(obj));
          break;

        case 'object':
          if (obj) {
            var pass = 0;
            if (obj.nodeType) {
              // Element or TextNode
              frag.appendChild(obj);
              pass = 1;
            } else if (obj.getNode) {
              // UI#getNode
              frag.appendChild(obj.getNode());
              pass = 1;
            } else if (objectPrototypeToString.call(obj) == '[object Array]') {
              frag.appendChild(this.createElement.apply(this, obj));
              pass = 1;
            }
            if (pass) {
              break;
            }
          }

        case 'number':
          frag.appendChild(this._document.createTextNode(obj));
          break;

        default:
          throw new Error('Invalid childNode value :' + obj);
      }
    }
    node.appendChild(frag);
  }
  return node;
};

exports.DOM = DOM;
exports.dom = new DOM(document);