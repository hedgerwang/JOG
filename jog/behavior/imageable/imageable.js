/**
 * @fileOverview Imageable
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var HashMap = require('jog/hashmap').HashMap;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

/**
 * @type {Array.<Imageable>}
 */
var imageablesToLoad = [];

/**
 * @type {Array.<Imageable>}
 */
var visibleImageablesToLoad = [];

/**
 * Load image asynchronously and lazily.
 * TODO(hedger): Hide image when it's off-screen?
 */
var Imageable = Class.create(EventTarget, {
  /**
   * @param {Element} element
   * @param {string} src
   * @param {number=} opt_resizeMode
   */
  main: function(element, src, opt_resizeMode) {
    this._element = element;
    this.src = src;
    this._resizeMode = opt_resizeMode;

    dom.addClassName(element, cssx('jog-behavior-imageable'));
    this._reflow();
    imageablesToLoad.push(this);

    this.callLater(processImageables, 16);
  },

  forceToShow: function() {
    this._forceShown = true;
    processImageables();
  },

  dispose: function() {
    var idx = imageablesToLoad.indexOf(this);
    if (idx > -1) {
      imageablesToLoad.slice(idx, 1);
    }
  },

  /**
   * @return {Element}
   */
  getElement: function() {
    return this._element;
  },

  _forceShown: false,

  _resizeMode: 0,

  _reflow: function() {
    if (!this._size) {
      var element = this._element;
      this._size = element.offsetWidth * element.offsetHeight;
    }
  },

  src: '',
  naturalWidth: 0,
  naturalHeight: 0,
  _size: 0,
  _element: null
});

Imageable.RESIZE_MODE_CROPPED = 1;
Imageable.RESIZE_MODE_USE_WIDTH = 2;
Imageable.RESIZE_MODE_USE_HEIGHT = 3;
Imageable.RESIZE_MODE_USE_NATURAL = 4;


/**
 *
 * @param element
 * @param uri
 * @param mode
 */
Imageable.resize = function(element, uri, mode) {

};

exports.Imageable = Imageable;

////////////////////////////////////////////////////////////////////////////////

var MAX_PROCESSING_COUNT = 2;
var processingCount = 0;
var imagesMap = new HashMap();

function processImageables() {
  if (!imageablesToLoad.length || processingCount >= MAX_PROCESSING_COUNT) {
    return;
  }

  collectSomeVisibleImageables();
  var imageable = visibleImageablesToLoad[0];

  if (!imageable) {
    imageablesToLoad.forEach(reflowImageable);
    setTimeout(processImageables, 1000);
    return;
  }

  processingCount++;
  var img = new Image();

  imagesMap.add(img, imageable);

  img.onload = handleOnloadOrError;
  img.onerror = handleOnloadOrError;
  img.src = imageable.src;
}

function collectSomeVisibleImageables() {
  visibleImageablesToLoad.length = 0;

  var viewHeight = Math.max(
    window.outerHeight,
    window.innerHeight,
    screen.height,
    document.documentElement.offsetHeight
  );

  var viewWidth = Math.max(
    window.outerWidth,
    window.innerWidth,
    screen.width,
    document.documentElement.offsetWidth
  );

  if (__DEV__) {
    // TODO(hedger): Remove this.
    var chrome = document.querySelector('.jog-ui-chrome');
    if (chrome) {
      viewHeight = chrome.offsetHeight + 100;
    }
  }

  var viewHeight2 = ~~(viewHeight * 1.25);
  var viewWidth2 = ~~(viewWidth * 1.1);

  for (var i = 0, imageable; imageable = imageablesToLoad[i]; i++) {
    if (imageable._forceShown) {
      visibleImageablesToLoad.push(imageable);
      continue;
    }

    if (!imageable._size && !imageable.disposed) {
      imageable._reflow();
    }

    if (imageable._size) {
      var el = imageable._element;
      var rect = el.getBoundingClientRect();
      if (rect.top > -1) {

        if (rect.top < viewHeight && rect.left < viewWidth2) {
          var thatEl = document.elementFromPoint(rect.left + 10, rect.top + 1);

          if (!thatEl || el === thatEl) {
            visibleImageablesToLoad.push(imageable);
            continue;
          }

          thatEl = document.elementFromPoint(rect.right - 10, rect.bottom - 1);
          if (!thatEl || el === thatEl) {
            visibleImageablesToLoad.push(imageable);
            continue;
          }
        }
      } else if (rect.top < viewHeight2) {
        visibleImageablesToLoad.push(imageable);
      }
    }

    if (visibleImageablesToLoad.length > MAX_PROCESSING_COUNT) {
      break;
    }
  }
}

function reflowImageable(imageable) {
  if (!imageable.disposed) {
    imageable._reflow();
  }
}

function handleOnloadOrError(event) {
  var img = event.currentTarget;
  var imageable = imagesMap.get(img);

  if (!imageable.disposed) {
    if (event.type === 'load') {
      var elStyle = imageable._element.style;
      if (img.naturalWidth) {
        var width = img.naturalWidth;
        var height = img.naturalHeight;
        switch (imageable._resizeMode) {
          case Imageable.RESIZE_MODE_USE_NATURAL:
            if (width < height) {
              elStyle.backgroundSize = 'auto 100%';
            } else if (width > height) {
              elStyle.backgroundSize = '100% auto';
            } else {
              elStyle.backgroundSize = '100% 100%';
            }
            break;

          case Imageable.RESIZE_MODE_USE_WIDTH:
            elStyle.backgroundSize = '100% auto';
            break;

          case Imageable.RESIZE_MODE_USE_HEIGHT:
            elStyle.backgroundSize = 'auto 100%';
            break;

          default:
            if (width < height) {
              elStyle.backgroundSize = '100% auto';
            } else if (width > height) {
              elStyle.backgroundSize = 'auto 100%';
            } else {
              elStyle.backgroundSize = '100% 100%';
            }
            break;
        }
      }
      elStyle.backgroundImage = 'url(' + img.src + ')';
      imageable.naturalWidth = width;
      imageable.naturalHeight = height;
      imageable.src = img.src;
      imageable.dispatchEvent('load');
    } else if (event.type === 'error') {
      console.warn('Fail to load image from ' + img.src);
      imageable.dispatchEvent('error');
    }


    imageable.dispose();
  }

  img.onload = null;
  img.onerror = null;
  imagesMap.remove(img);
  img.src = null;
  processingCount--;
  setTimeout(processImageables, 16);
}