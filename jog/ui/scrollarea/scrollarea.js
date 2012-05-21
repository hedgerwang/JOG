/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Scroller = require('jog/scroller').Scroller;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var ScrollArea = Class.create(BaseUI, {
  /**
   * @override
   * @param {Object} opt_options
   */
  main: function(opt_options) {
    // Ensure that these functions are always called as instance's methods.
    this.reflow = this.bind(this.reflow);
    this._renderScroll = this.bind(this._renderScroll);
    this._options = opt_options || {};
    this._scroller = new Scroller(this, this._options);
  },

  /** @override */
  dispose: function() {
    Animator.cancelAnimationFrame(this._renderID);
    this._scroller.dispose();
  },

  /** @override */
  createNode: function() {
    var content = dom.createElement('div', cssx('jog-ui-scrollarea_content'));

    var node = dom.createElement('div', cssx('jog-ui-scrollarea'), content);

    if (this._options.showpaginator &&
      this._options.direction === 'horizontal') {
      var pager = dom.createElement('i', cssx('jog-ui-scrollarea_paginator'));
      node.appendChild(pager);
    }

    this._paginatorEl = pager;
    this._element = node;
    this._content = content;

    return node;
  },

  /** @override */
  onDocumentReady:function() {
    this.reflow();
    this._renderScroll();
    this._bindListeners(true);
  },

  scrollTo: function(left, top) {
    this._scroller.scrollTo(left, top);
    this._renderScroll();
  },

  getScrollLeft: function() {
    return this._scroller.left;
  },

  getScrollTop: function() {
    return this._scroller.top;
  },

  getMaxScrollTop: function() {
    return this._scroller.maxScrollTop;
  },

  getMaxScrollLeft: function() {
    return this._scroller.maxScrollLeft;
  },

  getScrollWidth: function() {
    return this._scroller.width;
  },

  getScrollHeight: function() {
    return this._scroller.height;
  },

  getScrollPageCount: function() {
    return this._scroller.pagesCount;
  },

  reflow: function() {
    this._scroller.setDimensions(
      this._element.offsetWidth,
      this._element.offsetHeight,
      this._content.scrollWidth,
      this._content.scrollHeight
    );
    this._syncPaginator();
  },

  /**
   * Implementation of interface for Scroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScrollStart: function(left, top) {
    this.dispatchEvent('scrollstart');
    if (this._renderSlowly) {
      // Render the scrolling asynchronously with acceptable frame rate.
      Animator.cancelAnimationFrame(this._renderID);
      this._renderID = Animator.requestAnimationFrame(this._renderScroll);
    }
  },

  /**
   * Implementation of interface for Scroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScroll: function(left, top) {
    this.dispatchEvent('scroll');
    if (!this._renderSlowly) {
      this._renderScroll();
    }
  },

  /**
   * Implementation of interface for Scroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScrollEnd: function(left, top) {
    this._syncPaginator();
    if (this._renderSlowly) {
      // Cancel the asynchronous scroll-rendering that was set up at
      // TOUCHSTART.
      Animator.cancelAnimationFrame(this._renderID);
      delete this._renderID;
      this._renderScroll();
    }
    this.dispatchEvent('scroll');
  },

  /**
   * @param {boolean} forTouchStart
   */
  _bindListeners: function(forTouchStart) {
    var root = this._element;
    var events = this.getEvents();
    if (forTouchStart) {
      events.listen(root, TouchHelper.EVT_TOUCHSTART, this._onTouchStart);
    } else {
      events.listen(root, TouchHelper.EVT_TOUCHMOVE, this._onTouchMove);
      events.listen(root, TouchHelper.EVT_TOUCHEND, this._onTouchEnd);
      events.listen(root, TouchHelper.EVT_TOUCHCANCEL, this._onTouchEnd);
    }
    events.listen(root, 'click', this._onClick);
  },

  _clearListeners: function() {
    this.getEvents().unlistenAll();
  },

  /**
   * Public interface to pass in TOUCHSTART event in.
   * @param {Event} event
   */
  _onTouchStart: function(event) {
    this.reflow();
    this._scroller.doTouchStart(event);
    this._clearListeners();
    this._bindListeners(false);
  },

  _onTouchMove: function(event) {
    if (!event.defaultPrevented) {
      this._scroller.doTouchMove(event);
    }
  },

  _onTouchEnd: function(event) {
    this._scroller.doTouchEnd(event);
    this._clearListeners();
    this._bindListeners(true);
  },

  /**
   * Public interface to pass touch CLICK in.
   * @param {Event} event
   */
  _onClick: function(event) {
    if (this._scroller.scrolling) {
      event.preventDefault();
    }
  },


  _renderScroll: function() {
    delete this._renderID;
    var left = -this._scroller.left;
    var top = -this._scroller.top;

    if (this._renderedLeft !== left || this._renderedTop !== top) {
      this._renderedLeft = left;
      this._renderedTop = top;
      var style = this._content.style;

      if (this._useCSSTranslate) {
        style.webkitTransform = 'translate3d(' + left + 'px,' + top + 'px,0)';
      } else {
        style.left = left + 'px';
        style.top = top + 'px';
      }
    }

    if (this._renderSlowly && this._scroller.scrolling) {
      this._renderID = Animator.requestAnimationFrame(this._renderScroll);
    }
  },

  _syncPaginator: function() {
    if (this._paginatorEl) {
      var bubbleBase = dom.createElement('i', cssx('jog-ui-scrollarea_dot'));
      var fragment = dom.createDocumentFragment();
      var index = this._scroller.pageIndex;

      for (var i = 0; i < this._scroller.pagesCount; i++) {
        var bubble = bubbleBase.cloneNode(false);
        if (i === index) {
          dom.alterClassName(bubble, cssx('jog-ui-scrollarea_dot_on'), true);
        }
        fragment.appendChild(bubble);
      }
      this._paginatorEl.textContent = '';
      this._paginatorEl.appendChild(fragment);
    }
  },

  /**
   * @type {string}
   */
  _renderID: null,

  /**
   * @type {boolean}
   */
  _renderSlowly: (/android/gi).test(navigator.appVersion),

  /**
   * @type {Element}
   */
  _paginatorEl: null,

  /**
   * @type {Element}
   */
  _element : null,

  /**
   * @type {Element}
   */
  _content: null,

  /**
   * @type {boolean}
   */
  _useCSSTranslate : 'webkitTransform' in document.documentElement.style
});

exports.ScrollArea = ScrollArea;