/**
 * @fileOverview DOM Utilities.
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var lang = require('jog/lang').lang;

var objectPrototypeToString = Object.prototype.toString;


var DOM = Class.create(null, {
  /**
   * @constructor
   * @param {Document} doc
   */
  main:  function(doc) {
    this._document = doc;
    this._rootNode = doc.documentElement;
  },


  /**
   * @type {Document}
   * @private
   */
  _document : null,

  /**
   * @type {Node}
   */
  _rootNode: null,

  /**
   * @return {Node}
   */
  getRootNode: function() {
    return this._rootNode;
  },

  /**
   * @return {Document}
   */
  getDocument: function() {
    return this._document;
  },

  /**
   * @return {DocumentFragment}
   */
  createDocumentFragment: function() {
    return this._document.createDocumentFragment();
  },

  /**
   * @param {Node} node
   * @return {boolean}
   */
  isInDocument: function(node) {
    return node ? this._rootNode.contains(node) : false;
  },

  /**
   * @param {Node} node
   */
  remove: function(node) {
    node && node.parentNode && node.parentNode.removeChild(node);
  },

  /**
   * @param {Node} parentNode
   * @param {Node} childNode
   * @return {Node}
   */
  append: function(parentNode, childNode) {
    if (parentNode && childNode) {
      parentNode.appendChild(childNode);
      return childNode;
    }
    return null;
  },

  /**
   *
   * @param {Node} node
   * @param {Node} parentNode
   */
  prependChild: function(node, parentNode) {
    if (parentNode.firstChild) {
      parentNode.insertBefore(node, parentNode.firstChild);
    } else {
      parentNode.appendChild(node);
    }
  },

  /**
   * @param {Element} element
   * @param {string} className
   */
  addClassName: function(element, className) {
    element.className += ' ' + className;
  },

  /**
   * @param {Element} element
   * @param {string} className
   */
  removeClassName:function(element, className) {
    var element = element;
    element.className = element.className.replace(
      new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ').
      replace(/^\s+|\s+$/g, '');
  },

  /**
   * @param {Element} element
   * @param {string} className
   * @param {boolean} enabled
   */
  alterClassName: function(element, className, enabled) {
    enabled ? this.addClassName(element, className) :
      this.removeClassName(element, className);
  },

  /**
   *
   * @param {string} tagName
   * @param {Object} properties
   * @param {...*} more
   * @return {Element}
   */
  createElement: function(tagName, properties, more) {
    var node = this._document.createElement(tagName);
    if (typeof properties === 'string') {
      // TODO(hedger): Perf hit!. Should re-use the same object.
      properties = {
        className: properties
      }
    }
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
          node.setAttribute(key, value);
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
  },

  getViewportElement: function() {
    if (!this._chromeNode) {
      this._chromeNode = document.getElementById('debug-jog-chrome-element')
    }

    if (this._chromeNode) {
      return this._chromeNode;
    }

    return this._rootNode;
  },

  getViewportWidth: function() {
    var viewportElement = this.getViewportElement();

    if (this._chromeNode) {
      if (!this._viewportWidth) {
        this._viewportWidth = viewportElement.offsetWidth;
      }
    }

    return this._viewportWidth || (this._viewportWidth = Math.max(
      window.outerWidth,
      window.innerWidth,
      viewportElement.offsetWidth
    ));
  },

  getViewportHeight: function() {
    var viewportElement = this.getViewportElement();

    if (this._chromeNode) {
      if (!this._viewportHeight) {
        this._viewportHeight = viewportElement.offsetHeight;
      }
    }

    return this._viewportHeight || (
      this._viewportHeight = Math.max(
        window.outerHeight,
        window.innerHeight,
        viewportElement.offsetHeight
      ));
  },

  _chromeNode: null,
  _viewportWidth: 0,
  _viewportHeight: 0
});

// exports.DOM = DOM;
exports.dom = new DOM(document);