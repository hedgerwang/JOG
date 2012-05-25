/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Scrollable = require('jog/behavior/scrollable').Scrollable;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;

var Chunk = Class.create(BaseUI, {
  /** @override */
  main: function() {
    this._contentNode = this.getNode().firstChild;
  },

  /** @override */
  createNode: function() {
    var node = dom.createElement(
      'div', cssx('jog-ui-scrolllist-chunk'),
      ['div', cssx('jog-ui-scrolllist-chunk-content')]
    );
    return node;
  },

  /** @override */
  onDocumentReady: function() {
    dom.addClassName(this.getNode(), cssx('jog-ui-scrolllist-chunk-fadein'));
    this.scheduleCall(function() {
      dom.addClassName(this.getNode(), cssx('jog-ui-scrolllist-chunk-fadein-play'));
    }, 16);
    this._reflow();
  },

  /**
   * @param {number} top
   */
  setTop: function(top) {
    if (this._top !== top) {
      this._top = top;
      this.getNode().style.top = top + 'px';
    }
  },

  /**
   * @return {number}
   */
  getTop: function() {
    return this._top;
  },

  /**
   * @return {number}
   */
  getHeight: function() {
    return this._height;
  },

  getBottom: function() {
    // this.getNode().setAttribute('bottom', this.getTop() + this.getHeight());
    return this.getTop() + this.getHeight();
  },

  /**
   * @param {boolean} visible
   */
  setVisible: function(visible) {
    if (this._visible !== visible) {
      this._visible = visible;
      var node = this.getNode();
      var contentNode = this._contentNode;
      if (visible) {
        if (!this._contentNode.parentNode) {
          dom.removeClassName(contentNode,
            cssx('jog-ui-scrolllist-chunk-hidden'));
          dom.addClassName(contentNode,
            cssx('jog-ui-scrolllist-chunk-fadein'));
          node.appendChild(contentNode);
        }
        node.style.height = '';
        this._reflow();
      } else {
        node.style.height = this._height + 'px';
        // this._contentNode.style.visibility = 'hidden';
        node.removeChild(contentNode);
        dom.addClassName(contentNode, cssx('jog-ui-scrolllist-chunk-hidden'));
      }
    }
    this._reflow();
  },

  /**
   * @param {Element|BaseUI|string} content
   */
  addContent: function(content) {
    this.setVisible(true);
    var node;

    switch (typeof content) {
      case 'string':
        node = dom.getDocument().createTextNode(content);
        break;

      case 'object':
        if (content.nodeType === 1) {
          node = content;
        } else if (content instanceof BaseUI) {
          node = content.getNode();
          this.appendChild(content);
        }
        break;
    }

    if (__DEV__) {
      if (!node) {
        throw new Error('Invalid content ' + content);
      }
    }

    this._contentNode.appendChild(node);
    this._reflow();
  },

  _reflow: function() {
    if (this._visible) {
      this._height = this.getNode().scrollHeight;
    }
  },

  /**
   * @type {Element}
   */
  _contentNode: null,

  /**
   * @type {boolean|undefined}
   */
  _visible: true,

  /**
   * @type {number}
   */
  _height: 0,

  /**
   * @type {number}
   */

  _top: 0
});

exports.Chunk = Chunk;