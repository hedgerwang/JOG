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
var Imageable = Class.create(null, {
  /**
   * @param {Element} element
   * @param {string} src
   */
  main: function(element, src) {
    this._element = element;
    this._width = element.offsetWidth;
    this._height = element.offsetHeight;
    this._src = src;

    dom.addClassName(element, cssx('jog-behavior-imageable'));
    this._reflow();
    imageablesToLoad.push(this);

    processImageables();
  },

  dispose: function() {
    var idx = imageablesToLoad.indexOf(this);
    if (idx > -1) {
      imageablesToLoad.slice(idx, 1);
    }
  },

  _reflow: function() {
    if (!this._size) {
      var element = this._element;
      this._size = element.offsetWidth * element.offsetHeight;
    }
  },

  _size: 0,
  _element: null,
  _src: null
});

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
  img.src = imageable._src;
}

function collectSomeVisibleImageables() {
  visibleImageablesToLoad.length = 0;

  for (var i = 0, imageable; imageable = imageablesToLoad[i]; i++) {
    if (!imageable._size && !imageable.disposed) {
      imageable._reflow();
    }

    if (imageable._size) {
      var el = imageable._element;
      var rect = el.getBoundingClientRect();
      if (rect.top > -1 &&
        rect.top < 1200 &&
        el === document.elementFromPoint(rect.left + 1, rect.top + 1)) {
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
        if (width < height) {
          elStyle.backgroundSize = '100% auto';
        } else if (width > height) {
          elStyle.backgroundSize = 'auto 100%';
        } else {
          elStyle.backgroundSize = '100% 100%';
        }
      }
      elStyle.backgroundImage = 'url(' + img.src + ')';
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

exports.Imageable = Imageable;