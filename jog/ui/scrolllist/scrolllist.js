/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Chunk = require('jog/ui/scrolllist/chunk').Chunk;
var Scrollable = require('jog/behavior/scrollable').Scrollable;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;
var lang = require('jog/lang').lang;


var ScrollList = Class.create(BaseUI, {
  /** @override */
  main: function() {
    this._chunks = [];
    this._scrollElement = this.getNode();
    this._scrollBody = this.getNode().firstChild;
    this._scrollDimentions = [1, 1, 1, 1];
    this._scrollable = new Scrollable(
      this._scrollElement,
      {dimentions: this._scrollDimentions}
    );
    this._contentsQueue = [];
    this._toggleChunks = lang.throttle(this._toggleChunks, 200, this);
    this._processContent = lang.throttle(this._processContentNow, 200, this);

  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div', cssx('jog-ui-scrolllist'),
      ['div', cssx('jog-ui-scrolllist-body')]
    );
    return node;
  },

  /** @override */
  onDocumentReady: function() {
    this._processContent();
    var events = this.getEvents();
    events.listen(this._scrollable, 'scroll', this._onScroll);
    events.listen(this._scrollable, 'touchstart', this._onScrollStart);
    events.listen(this._scrollable, 'scrollend', this._onScrollEnd);
  },

  /** @override */
  dispose: function() {
    this._scrollable.dispose();
    // lang.unthrottle(this.reflow);
  },

  /**
   * @param {Element|BaseUI|string} content
   */
  addContent: function(content) {
    this._contentsQueue.push(content);
    if (this.isInDocument()) {
      this._processContent();
    }
  },

  _onScrollStart : function(evt) {
    lang.unthrottle(this._toggleChunks);
    lang.unthrottle(this._processContent);
    this._processContentNow();
  },

  _onScroll: function(left, top) {
    var now = Date.now();
    if (now - this._lastScrollTime > 300) {
      this._lastScrollTime = now;
      this._processContent();
    }
  },

  _onScrollEnd : function(evt) {
    this._processContent();
  },

  _reflow: function() {
    var dimentions = this._scrollDimentions;
    dimentions[1] = this._scrollElement.offsetHeight;

    if (this._lastChunk) {
      // scrollHeight
      this._scrollDimentions[3] =
        Math.max(dimentions[1], this._lastChunk.getBottom());
    } else {
      // scrollHeight
      this._scrollDimentions[3] = dimentions[1];
    }

    // so we can scroll more.
    // this._scrollDimentions[3] += dimentions[1] * 4;

    // Chunk height limit.
    this._maxChunkHeight = Math.max(
      dimentions[0],
      dimentions[1],
      window.innerWidth,
      window.innerHeight
    ) * 3;
    this._scrollable.reflow();
  },

  _toggleChunks: function() {
    var dimentions = this._scrollDimentions;
    var limitBuffer = this._maxChunkHeight;
    var scrollTop = this._scrollable.getScrollTop();
    var limitTop = scrollTop - limitBuffer;
    var limitBottom = scrollTop + dimentions[1] + limitBuffer;
    for (var i = 0, chunk; chunk = this._chunks[i]; i++) {
      chunk.setVisible(this._shouldShowChunk(limitTop, limitBottom, chunk));
    }
  },

  /**
   * @param {Element|BaseUI|string} content
   */
  _processContent: function() {
  },

  /**
   * @param {Element|BaseUI|string} content
   */
  _processContentNow: function(e) {
    this._reflow();

    if (!this._contentsQueue.length) {
      return;
    }

    var dimentions = this._scrollDimentions;
    var limitBuffer = this._maxChunkHeight;
    var scrollTop = this._scrollable.getScrollTop();
    var limitBottom = scrollTop + dimentions[1] + limitBuffer;

    if (!this._lastChunk) {
      this._addChunk();
      this._firstChunk = this._lastChunk;
    }

    if (this._firstChunk !== this._lastChunk &&
      this._lastChunk.getTop() > limitBottom) {
      // console.log('// We already have enough chunks to show',  scrollTop);
      this._toggleChunks();
      return;
    }

    var targetChunk = this._lastChunk;

//    if (targetChunk.getBottom() > limitBottom) {
//      // this._toggleChunks();
//      // return;
//    }

    var contents = this._contentsQueue;
//    if (this._firstChunk === targetChunk) {
//      limitBuffer += 1000;
//    }

    while (contents.length) {
      targetChunk.addContent(contents.shift());
      if (targetChunk.getHeight() > limitBuffer) {
        this._addChunk();
        break;
      }
    }


    this._reflow();
    this._toggleChunks();
  },

  /**
   *
   * @param {number} limitTop
   * @param {number} limitBottom
   * @param {Chunk} chunk
   * @reutrn {boolean}
   */
  _shouldShowChunk: function(limitTop, limitBottom, chunk) {
    if (!chunk.getHeight()) {
      return true;
    }

    var hidden = chunk.getBottom() < limitTop ||
      chunk.getTop() > limitBottom;

    return !hidden;
  },

  /**
   * @return {Chunk}
   */
  _addChunk: function() {
    var prevChunk = this._chunks.length ?
      this._chunks[this._chunks.length - 1] : null;

    var chunk = new Chunk();
    chunk.render(this._scrollable.getBody());
    chunk.setTop(prevChunk ? prevChunk.getBottom() : 0);
    this.appendChild(chunk);
    this._chunks.push(chunk);
    this._lastChunk = chunk;
    return chunk;
  },

  /**
   * @type {Chunk}
   */
  _firstChunk: null,

  /**
   * @type {Chunk}
   */
  _lastChunk: null,

  /**
   * @type {Array.<Chunk>}
   */
  _chunks: null,

  /**
   * @type {Array}
   */
  _contentsQueue : null,

  /**
   * @type {Element}
   */
  _scrollElement : null,

  /**
   * @type {Element}
   */
  _scrollBody : null,

  /**
   * @type {number}
   */
  _maxChunkHeight: 0,

  /**
   * @type {number}
   */
  _lastScrollTime: 0,

  /**
   * @type {Scrollable}
   */
  _scrollable : null
});


exports.ScrollList = ScrollList;






