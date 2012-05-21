/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var Class = require('jog/class').Class;
var Events = require('jog/events').Events;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Scroller = require('jog/behavior/scrollable/scroller').Scroller;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var Scrollable = Class.create(EventTarget, {
  /**
   * @override
   * @param {{Element} element
   * @param {Object} opt_options
   */
  main: function(element, opt_options) {
    // Ensure that these functions are always called as instance's methods.
    this.reflow = this.bind(this.reflow);
    this._renderScroll = this.bind(this._renderScroll);
    this._element = element;
    this._content = element.children[0];
    this._options = opt_options || {};
    this._scroller = new Scroller(this, opt_options);
    this._events = new Events(this);

    if (opt_options &&
      opt_options.showpaginator &&
      opt_options.direction === 'horizontal') {
      this._paginator = dom.createElement(
        'div', cssx('jog-bebavior-scrollable_paginator'));
      element.appendChild(paginator);
    }

    dom.addClassName(this._element, cssx('jog-bebavior-scrollable'));
    dom.addClassName(this._content, cssx('jog-bebavior-scrollable_content'));
    this._scroller = new Scroller(this, opt_options);
    this.reflow();
    this._renderScroll();
    this._bindListeners(true);
  },

  /** @override */
  dispose: function() {
    Animator.cancelAnimationFrame(this._renderID);
    this._scroller.dispose();
    this._events.dispose();
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
    var events = this._events;
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
    this._events.unlistenAll();
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
    if (this._paginator) {
      var dot = dom.createElement('i', cssx('jog-bebavior-scrollable_dot'));
      var fragment = dom.createDocumentFragment();
      var index = this._scroller.pageIndex;

      for (var i = 0; i < this._scroller.pagesCount; i++) {
        var newDot = dot.cloneNode(false);
        if (i === index) {
          dom.addClassName(newDot, cssx('jog-bebavior-scrollable_dot_on'));
        }
        fragment.appendChild(newDot);
      }
      this._paginator.textContent = '';
      this._paginator.appendChild(fragment);
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
  _paginator : null,

  /**
   * @type {Element}
   */
  _content: null,

  /**
   * @type {boolean}
   */
  _useCSSTranslate : 'webkitTransform' in document.documentElement.style
});

exports.Scrollable = Scrollable;