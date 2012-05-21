/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var ScrollArea = Class.create(BaseUI, {
  /**
   * @override
   * @param {Object} opt_options
   */
  main: function(opt_options) {
    var options = opt_options || {};
    var element = this.createNode();

    // Ensure that these functions are always called as instance's methods.
    this.reflow = this.bind(this.reflow);
    this._onTouchMove = this.bind(this._onTouchMove);
    this._onTouchEnd = this.bind(this._onTouchEnd);
    this._renderScroll = this.bind(this._renderScroll);

    this._element = element;
    this._content = element.children[0];
    this._scroller = null; // new JX.MScrollAreaScroller(this, options);

//    if (options.showpaginator && options.direction === 'horizontal') {
//      this._paginatorEl = this._element.lastChild;
//      if (__DEV__) {
//        if (!(/\bscrollAreaPaginator\b/).test(this._paginatorEl.className)) {
//          throw new Error('Invalid paginator element');
//        }
//      }
//    }

    this.reflow();
    this._renderScroll();
  },

  /** @override */
  dispose: function() {
    JX.MAnimator.cancelAnimationFrame(this._renderID);

    if (this._paginatorEl) {
      JX.DOM.setContent(this._paginatorEl, '');
    }

    this._clearListeners();
    this._scroller.dispose();
    for (var property in this) {
      delete this[property];
    }
    this._disposed = true;
  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div');
    return node;
  },

  /** @override */
  onDocumentReady:function() {

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
   * Public interface for Javelin behavior to pass TOUCHSTART event in.
   * @param {JX.Event} jxEvent
   */
  onTouchStart: function(jxEvent) {
    this.reflow();
    this._scroller.doTouchStart(jxEvent);
    this._clearListeners();
    this._bindListeners();
  },

  /**
   * Public interface for Javelin behavior to pass touch CLICK in.
   * @param {JX.Event} jxEvent
   */
  onClick: function(jxEvent) {
    if (this._scroller.scrolling) {
      jxEvent.prevent();
    }
  },

  /**
   * Implementation of interface for MScrollAreaScroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScrollStart: function(left, top) {
    JX.Stratcom.invoke('MScrollArea:scrollstart', null, this._eventData);
    if (this._renderSlowly) {
      // Render the scrolling asynchronously with acceptable frame rate.
      JX.MAnimator.cancelAnimationFrame(this._renderID);
      this._renderID = JX.MAnimator.requestAnimationFrame(this._renderScroll);
    }
  },

  /**
   * Implementation of interface for MScrollAreaScroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScroll: function(left, top) {
    JX.Stratcom.invoke('MScrollArea:scroll', null, this._eventData);
    if (!this._renderSlowly) {
      this._renderScroll();
    }
  },

  /**
   * Implementation of interface for MScrollAreaScroller's handler.
   * @param {number} left
   * @param {number} top
   */
  onScrollEnd: function(left, top) {
    this._syncPaginator();

    this._eventData.scrollEndCount++;
    JX.Stratcom.invoke('MScrollArea:scrollend', null, this._eventData);

    if (this._renderSlowly) {
      // Cancel the asynchronous scroll-rendering that was set up at
      // TOUCHSTART.
      JX.MAnimator.cancelAnimationFrame(this._renderID);
      delete this._renderID;
      this._renderScroll();
    }
  },

  _bindListeners: function() {
    var root = this._element;
    this._listeners.push(
      JX.DOM.listen(
        root,
        JX.MTouchHelper.EVT_TOUCHMOVE,
        null,
        this._onTouchMove
      ),
      JX.DOM.listen(
        root,
        JX.MTouchHelper.EVT_TOUCHEND,
        null,
        this._onTouchEnd
      ),
      JX.DOM.listen(
        root,
        JX.MTouchHelper.EVT_TOUCHCANCEL,
        null,
        this._onTouchEnd
      )
    );
  },

  _clearListeners: function() {
    for (var i = 0, listener; listener = this._listeners[i]; i++) {
      listener.remove();
    }
    this._listeners.length = 0;
  },

  _onTouchMove: function(jxEvent) {
    if (!jxEvent.getPrevented()) {
      this._scroller.doTouchMove(jxEvent);
    }
  },

  _onTouchEnd: function(jxEvent) {
    this._scroller.doTouchEnd(jxEvent);
    this._clearListeners();
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
      this._renderID = JX.MAnimator.requestAnimationFrame(this._renderScroll);
    }
  },

  _syncPaginator: function() {
    if (this._paginatorEl) {
      var bubbleBase = JX.$N('i', {className:'scrollAreaPaginatorBubble'});
      var fragment = document.createDocumentFragment();
      var index = this._scroller.pageIndex;
      for (var i = 0; i < this._scroller.pagesCount; i++) {
        var bubble = bubbleBase.cloneNode(false);
        if (i === index) {
          JX.DOM.alterClass(bubble, 'scrollAreaPaginatorBubbleActive', true);
        }
        fragment.appendChild(bubble);
      }
      JX.DOM.setContent(this._paginatorEl, fragment);
    }
  }
});

exports.ScrollArea = ScrollArea;