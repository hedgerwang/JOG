/**
 * @fileOverview Imageable
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var HashMap = require('jog/hashmap').HashMap;
var ImageableManager = require('jog/behavior/imageable/imageablemanager').ImageableManager;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var manager = new ImageableManager(1);

var debugTargetElement;

/**
 * Load image asynchronously and lazily.
 * TODO(hedger): Hide image when it's off-screen?
 */
var Imageable = Class.create(EventTarget, {

  /**
   * @type {string}
   */
  src: '',

  /**
   * @type {number}
   */
  naturalWidth: 0,

  /**
   * @type {number}
   */
  naturalHeight: 0,

  /**
   * @type {number}
   */
  width: 0,

  /**
   * @type {number}
   */
  height: 0,

  /**
   * @param {Element} element
   * @param {string} src
   * @param {number=} opt_resizeMode
   * @param {boolean=} opt_useCanvas
   */
  main: function(element, src, opt_resizeMode, opt_useCanvas) {
    this.src = src;

    this._element = element;
    this._resizeMode = opt_resizeMode || Imageable.RESIZE_MODE_CROPPED;
    this._useCanvas = !!opt_useCanvas;

    dom.addClassName(element, cssx('jog-behavior-imageable'));
    manager.register(this);

    if (__DEV__) {
      element.setAttribute('debug_imagable_src', this.src);
    }
  },

  dispose: function() {
    manager.unregister(this);
    var img = this._loadingImage;

    if (img) {
      delete img.onload;
      delete img.onerror;
      img.src = 'data:image/gif;base64,' +
        'R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    }
  },

  /**
   * @return {Imageable}
   */
  clone: function() {
    return new Imageable(
      this._element,
      this.src,
      this._resizeMode,
      this._useCanvas);
  },

  load: function() {
    if (this._loadingImage || !this.shouldLoad()) {
      return;
    }

    this.src = this._normalizeSrc(this.src);
    this._loadingImage = new Image();

    var img = this._loadingImage;
    var handler = this.bind(this._handleLoad);
    img.onload = handler;
    img.onerror = handler;
    img.src = this.src;
  },

  /**
   * @return {boolean}
   */
  shouldLoad: function() {
    return this.isVisible();
  },

  /**
   * @return {boolean}
   */
  isVisible: function() {
    if (!this._element || this.disposed) {
      return false;
    }

    var viewLeft = 0;
    var viewRight = dom.getViewportWidth();
    var viewTop = 0;
    var viewBottom = dom.getViewportHeight();
    var buffer = 30;

    var rect = this._element.getBoundingClientRect();

    if (!this.width) {
      this.width = this._element.offsetWidth;
      this.height = this._element.offsetHeight;
    }

    if (__DEV__) {
      var viewRect = dom.getViewportElement().getBoundingClientRect();
      viewLeft = viewRect.left;
      viewTop = viewRect.top;
      viewRight = viewRect.right;
      viewBottom = viewRect.bottom;
    }

    if (!this.width) {
      return false;
    }

    if (rect.top > viewBottom + buffer || rect.bottom < viewTop - buffer) {
      return false;
    }

    if (rect.left > viewRight + buffer || rect.right < viewLeft - buffer) {
      return false;
    }

    var count = 3;
    var dx = ~~(rect.width / count);
    var dy = ~~(rect.height / count);
    var x = rect.left;
    var y = rect.top;

    while (count) {
      count--;
      var offset = count > 0 ? 1 : -1;
      // TODO(hedger): Fix document.elementFromPoint
      // See http://www.icab.de/blog/2011/10/17/elementfrompoint-under-ios-5/
      var testElement = document.elementFromPoint(x + offset, y + offset);
      if (testElement === this._element) {
        return true;
      }
      x += dx;
      y += dy;
    }

    if (__DEV__) {
      if (this.width > 50 && this.height > 50) {
        if (debugTargetElement !== this._element) {
          // Use debugTargetElement to avoid over-logging.
          debugTargetElement = this._element;
          /*
           console.info(
           'A big element in view could not be pointed',
           this._element,
           testElement,
           rect
           );
           */
        }
      }
    }

    return false;
  },

  /**
   * @return {boolean}
   */
  shouldReload:function() {
    return this.src && !this.disposed && dom.isInDocument(this._element);
  },

  show: function() {
    if (this.disposed || this._shown) {
      return;
    }

    this._shown = true;

    if (!this.naturalWidth) {
      if (__DEV__) {
        throw new Error('Attempt to show an image that is not ready. ' +
          ', naturalWidth = 0' +
          ', naturalHeight = 0' +
          ', src = ' + this.src);
      }
      return;
    }

    if (this._useCanvas) {
      this._showAsCanvas();
    } else {
      this._showAsCSSBackground();
    }
    this.dispatchEvent('show');
  },

  _showAsCanvas: function() {
    var canvas = dom.createElement('canvas', {
      className: cssx('jog-behavior-imageable_canvas'),
      width: this.width,
      height: this.height
    });

    var nw = this.naturalWidth;
    var nh = this.naturalHeight;
    var ratio = nw / nh;
    var cw = this.width;
    var ch = this.height;

    switch (this._resizeMode) {
      case Imageable.RESIZE_MODE_USE_WIDTH:
        ch = cw / ratio;
        break;

      case Imageable.RESIZE_MODE_USE_HEIGHT:
        cw = ratio * ch;
        break;

      case Imageable.RESIZE_MODE_USE_NATURAL:
        if (nw < nh) {
          cw = ratio * ch;
        } else if (nw > nh) {
          ch = cw / ratio;
        }
        break;

      case Imageable.RESIZE_MODE_CROPPED:
        if (nw < nh) {
          ch = cw / ratio;
        } else if (nw > nh) {
          cw = ratio * ch;
        }
        break;

      default:
        if (__DEV__) {
          throw new Error('Invalid resize mode specified.' + this.src);
        }
        return;
    }

    var cx = ~~((this.width - cw) / 2);
    var cy = ~~((this.height - ch) / 2);
    cw = ~~cw;
    ch = ~~ch;
    canvas.getContext('2d').drawImage(
      this._loadingImage, cx, cy, cw, ch);

    canvas.imageSrc = this._loadingImage.src;
    canvas.imageW = cw;
    canvas.imageH = ch;
    canvas.imageX = cx;
    canvas.imageY = cy;
    this._element.appendChild(canvas);
  },

  _showAsCSSBackground: function() {
    var bgSize;
    var nw = this.naturalWidth;
    var nh = this.naturalHeight;

    switch (this._resizeMode) {
      case Imageable.RESIZE_MODE_USE_WIDTH:
        bgSize = '100% auto';
        break;

      case Imageable.RESIZE_MODE_USE_HEIGHT:
        bgSize = 'auto 100%';
        break;

      case Imageable.RESIZE_MODE_USE_NATURAL:
        if (nw < nh) {
          bgSize = 'auto 100%';
        } else if (nw > nh) {
          bgSize = '100% auto';
        } else {
          bgSize = '100% 100%';
        }
        break;

      case Imageable.RESIZE_MODE_CROPPED:
        if (nw < nh) {
          bgSize = '100% auto';
        } else if (nw > nh) {
          bgSize = 'auto 100%';
        } else {
          bgSize = '100% 100%';
        }
        break;

      default:
        if (__DEV__) {
          throw new Error('Invalid resize mode specified.' + this.src);
        }
        return;
    }

    if (__DEV__) {
      var debugInfo = [
        bgSize,
        this.src,
        this.naturalWidth,
        this.naturalHeight
      ];
      console.info('Show image as background:', debugInfo);
    }

    this._element.style.backgroundSize = bgSize;
    this._element.style.backgroundImage = 'url("' + this.src + '")';
  },

  _handleLoad: function(event) {

    if (__DEV__) {
      if (event.type === 'error') {
        console.error(
          'Imageload:_handleLoad',
          event.type,
          this.src,
          this.width,
          this.height,
          this
        );
      }
    }

    if (event.type === 'error') {
      dom.addClassName(this._element, cssx('jog-behavior-imageable-error'));
    }

    this.naturalWidth = this._loadingImage.naturalWidth;
    this.naturalHeight = this._loadingImage.naturalHeight;

    var rect1 = this._element.getBoundingClientRect();
    var evtType = event.type;
    var retryCount = 0;
    var checkSpeed = function() {
      var rect2 = this._element.getBoundingClientRect();
      var dy = Math.abs(rect2.top - rect1.top);
      if (dy < 90 || retryCount > 5) {
        // Do not dispatch load/error event until the element is slow down.
        this.dispatchEvent(evtType);
        this.dispose();
        checkSpeed = null;
        evtType = null;
        rect1 = null;
        rect2 = null;
        retryCount = 0;
      } else {
        retryCount++;
        rect1 = rect2;
        this.setTimeout(checkSpeed, 300);
      }
    };
    this.setTimeout(checkSpeed, 300);
  },

  /**
   * @param {string} src
   */
  _normalizeSrc: function(src) {
    if (!src) {
      console.warn('empty src', src);
      return '';
    }

    if (src.indexOf('://fbexternal-a.akamaihd.net') > -1) {
      // TODO(hedger): I don't like this solution but this is how to fix it
      // now.
      console.warn(src + ' mat contain large image, should fix it.');

      var match = src.match(/[\?&]url=([^&]+)&?/);
      if (match && match[1]) {
        console.warn('Reset src from: ' + src);
        src = decodeURIComponent(match[1]);
        console.warn('To: ' + src);
        return src;
      }
    }

    return src;
  },

  /**
   * @type {Image}
   */
  _loadingImage: null,

  /**
   * @type {number}
   */
  _resizeMode: 0,

  /**
   * @type {number}
   */
  _element: null,

  /**
   * @type {boolean}
   */
  _shown: false
});

Imageable.RESIZE_MODE_CROPPED = 1;
Imageable.RESIZE_MODE_USE_WIDTH = 2;
Imageable.RESIZE_MODE_USE_HEIGHT = 3;
Imageable.RESIZE_MODE_USE_NATURAL = 4;

exports.Imageable = Imageable;


