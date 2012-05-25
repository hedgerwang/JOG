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


var SimpleScrollList = Class.create(BaseUI, {
  /** @override */
  main: function() {
    this._chunks = [];
    this._contentsQueue = [];
    this._onScrollCheck = this.bind(this._onScrollCheck);
    this._toggleChunks = lang.throttle(this._toggleChunks, 200, this);
    this._processContent = lang.throttle(this._processContent, 200, this);
  },

  /** @override */
  createNode: function() {
    var node = dom.createElement('div', cssx('jog-ui-simplescrolllist'));
    return node;
  },

  /** @override */
  onDocumentReady: function() {
    this._processContent();
    var events = this.getEvents();
    events.listen(this.getNode(), 'scroll', this._onScroll);
  },

  /** @override */
  dispose: function() {
    clearInterval(this._onScrollTimer);
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

  _reflow: function() {
    // reflow all chunks?
  },

  _onScroll: function(left, top) {
    this.getEvents().unlisten(this.getNode(), 'scroll', this._onScroll);
    this._onScrollTop = window.pageYOffset;
    this._onScrollTimer = setInterval(this._onScrollCheck, 500);
  },

  _onScrollCheck :function() {
    if (this._onScrollTimer) {
      var scrollTop = this.getNode().scrollTop;
      if (this._onScrollTop !== scrollTop) {
        this._onScrollTop = scrollTop;
        this._processContent();
      } else {
        clearInterval(this._onScrollTimer);
        this.getEvents().listen(this.getNode(), 'scroll', this._onScroll);
      }
    }
  },

  _toggleChunks: function() {
    var height = this.getNode().offsetHeight;
    var limitBuffer = height * 2;
    var scrollTop = this.getNode().scrollTop;
    var limitTop = scrollTop - limitBuffer;
    var limitBottom = scrollTop + height + limitBuffer;
    for (var i = 0, chunk; chunk = this._chunks[i]; i++) {
      chunk.setVisible(this._shouldShowChunk(limitTop, limitBottom, chunk));
    }
  },

  _processContent: function() {
    this._reflow();

    if (!this._contentsQueue.length) {
      return;
    }

    var height = this.getNode().offsetHeight;
    var limitBuffer = height * 2;
    var scrollTop = this.getNode().scrollTop;
    var limitBottom = scrollTop + height * 2 + limitBuffer;

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

    if (targetChunk.getBottom() > limitBottom) {
      this._toggleChunks();
      return;
    }

    var contents = this._contentsQueue;

    var loopCount = 0;
    while (contents.length) {
      targetChunk.addContent(contents.shift());
      // calling getHeight() is expensive.
      // Don't do that for each loop.
      if (((loopCount % 3) === 1) && targetChunk.getHeight() > limitBuffer) {
        this._addChunk();
        break;
      }
      loopCount++;
    }

    this._reflow();
    this._toggleChunks();
  },

  /**
   * @return {Chunk}
   */
  _addChunk: function() {
    var prevChunk = this._chunks.length ?
      this._chunks[this._chunks.length - 1] : null;

    var chunk = new Chunk();
    chunk.render(this.getNode());
    chunk.setTop(prevChunk ? prevChunk.getBottom() : 0);
    this.appendChild(chunk);
    this._chunks.push(chunk);
    this._lastChunk = chunk;
    return chunk;
  },

  /**
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
   * @type {number}
   */
  _onScrollTimer: 0,

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
  _contentsQueue : null
});


exports.SimpleScrollList = SimpleScrollList;