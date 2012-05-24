/**
 * @fileOverview Scene
 * @author Hedger Wang
 */

var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var Chunk = require('jog/ui/scrolllist/chunk').Chunk;
var Scrollable = require('jog/behavior/scrollable').Scrollable;
var CSSScrollable = require('jog/behavior/cssscrollable').CSSScrollable;
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

    // this._processContent = this.bind(this._processContent);
    this._processContent = lang.throttle(this._processContent, 16, this);
    // this._toggleChunks = lang.throttle(this._toggleChunks, 10, this);
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
    var events = this.getEvents();
    // events.listen(this._scrollable, 'scroll', this._toggleChunks);
    this._processContent();
    events.listen(this._scrollable, 'scrollstart', this._toggleChunks);
    events.listen(this._scrollable, 'scroll', this._processContent);
    events.listen(this._scrollable, 'scrollend', this._toggleChunks);
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

  reflow: function() {
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
    this._scrollDimentions[3] += dimentions[1] * 3;

    // Chunk height limit.
    this._maxChunkHeight = Math.max(dimentions[0], dimentions[1]) * 1;
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
  _processContent: function(e) {
    this.reflow();

    if (!this._contentsQueue.length) {
      return;
    }

    var dimentions = this._scrollDimentions;
    var limitBuffer = this._maxChunkHeight;
    var scrollTop = this._scrollable.getScrollTop();
    var limitBottom = scrollTop + dimentions[1] + limitBuffer;
    if (!this._lastChunk) {
      this._addChunk();
    }

    if (this._lastChunk.getTop() > limitBottom) {
      // console.log('// We already have enough chunks to show',  scrollTop);
      return;
    }

    var targetChunk = this._lastChunk;

    if (targetChunk.getBottom() > limitBottom) {
      // console.log('targetChunk.getBottom() > limitBottom');
      return;
    }

    var contents = this._contentsQueue;

    while (contents.length) {
      targetChunk.addContent(contents.shift());

      if (targetChunk.getHeight() > limitBuffer) {
        this._addChunk();
        break;
      }

      if (targetChunk.getBottom() > limitBottom) {
        // we have enough content in the chunk.
        // break;
      }
    }

    this.reflow();
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
   * @type {Scrollable}
   */
  _scrollable : null
});


exports.ScrollList = ScrollList;






