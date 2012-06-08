/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Chunk = require('jog/ui/scrolllist/chunk').Chunk;
var Class = require('jog/class').Class;
var Scrollable = require('jog/behavior/scrollable').Scrollable;
var UserAgent = require('jog/useragent').UserAgent;
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
    this._processContentNow = this.bind(this._processContentNow);
    this._toggleChunks = lang.throttle(this._toggleChunks, 200, this);
    this._processContent = lang.throttle(this._processContentNow, 200);
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
    events.listen(this._scrollable, 'scrollstart', this._onScrollStart);
    events.listen(this._scrollable, 'scrollend', this._onScrollEnd);
  },

  /** @override */
  dispose: function() {
    clearTimeout(this._onScrollTimer);
    this._scrollable.dispose();
    lang.unthrottle(this._toggleChunks);
    lang.unthrottle(this._processContent);
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

  clearContent: function() {
    this._contentsQueue.length = 0;

    for (var i = 0, chunk; chunk = this._chunks[i]; i++) {
      this.removeChild(chunk);
    }

    this._chunks.length = 0;
    this._lastChunk = null;
    this._reflow();
    this._scrollable.scrollTo(0, 0);
  },


  _onScrollStart: function(left, top) {
    clearTimeout(this._onScrollTimer);
    delete this._onScrollTimer;
    this._processContent();
  },

  _onScrollEnd: function(left, top) {
    clearTimeout(this._onScrollTimer);
    this._onScrollTimer = this.callLater(this._processContentNow, 300);
  },

  _reflow: function() {
    if (this.disposed) {
      return;
    }

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

    // Chunk height limit.
    this._maxChunkHeight = Math.max(
      dimentions[0],
      dimentions[1]
    ) * (UserAgent.IS_ANDROID ? 3 : 4);

    if (UserAgent.IS_ANDROID) {
      this._maxChunkHeight = Math.min(2200, this._maxChunkHeight);
    }

    this._scrollable.reflow();
  },

  _toggleChunks: function() {
    var dimentions = this._scrollDimentions;
    var buffer = this._maxChunkHeight;
    var scrollTop = this._scrollable.getScrollTop();
    var top = scrollTop - buffer;
    var bottom = scrollTop + dimentions[1] + buffer;
    for (var i = 0, chunk; chunk = this._chunks[i]; i++) {
      chunk.setVisible(this._shouldShowChunk(top, bottom, chunk));
    }
  },

  _processContent: function() {
    if (__DEV__) {
      throw new Error('Function noy implemented');
    }
  },

  _processContentNow: function() {
    this._reflow();

    if (!this._contentsQueue.length) {
      this._toggleChunks();
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
      // We already have enough chunks to show',  scrollTop);
      this._toggleChunks();
      return;
    }

    var targetChunk = this._lastChunk;

    if (targetChunk.getBottom() > limitBottom) {
      this._toggleChunks();
      return;
    }

    var contents = this._contentsQueue;

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
   * @param {number} top
   * @param {number} bottom
   * @param {Chunk} chunk
   * @reutrn {boolean}
   */
  _shouldShowChunk: function(top, bottom, chunk) {
    if (!chunk.getHeight()) {
      return true;
    } else {
      return !(chunk.getTop() > bottom ||
        chunk.getBottom() < top);
    }
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
  _onScrollTimer: 0,

  /**
   * @type {Scrollable}
   */
  _scrollable : null
});


exports.ScrollList = ScrollList;






