/**
 * @fileOverview Scroller
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var BaseUI = require('jog/ui/baseui').BaseUI;
var Class = require('jog/class').Class;
var HashMap = require('jog/hashmap').HashMap;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var UserAgent = require('jog/useragent').UserAgent;
var dom = require('jog/dom').dom;

/**
 * @type {HashMap}
 */
var elementToScrollerMap = new HashMap();
var scrollerToElementMap = new HashMap();

var Scroller = Class.create(null, {
  /**
   * @param {Object} handler An object that has these methods implemented:
   *        - onScroll: function(left, top)
   *        - onScrollStart: function(left, top)
   *        - onScrollEnd: function(left, top)
   *
   *        position. This function shall take two arguments which represent the
   *        scrollLeft and the scrollTop positions.
   * @param {Object} opt_options A optional Object that holds the scroller's
   *        setting.
   */
  main : function(handler, opt_options) {
    if (__DEV__) {
      if (!handler || !handler.onScroll ||
        !handler.onScrollEnd || !handler.onScrollStart) {
        throw new Error('Improper Scroller handler provided');
      }
    }

    // Ensure that these functions are always called as instance's methods.
    this._canAnimate = this.bind(this._canAnimate);

    var options = opt_options || {};
    this._usePaging = options.paging;

    // For now, we only support one direction scrolling.
    this._canScrollX = (options.direction === 'horizontal');
    this._canScrollY = !this._canScrollX;
    this._handler = handler;
    this._animator = new Animator();
  },

  dispose: function() {
    Class.dispose(this._animator);
    var element = scrollerToElementMap.get(this);
    if (element) {
      elementToScrollerMap.remove(element);
    }
  },

  // Public member properties must always be read-only to the owner of the
  // scroller.

  scrolling: false,

  width: 0,

  height: 0,

  scrollWidth: 0,

  scrollHeight: 0,

  left: 0,

  top: 0,

  minScrollTop : 0,

  minScrollLeft: 0,

  maxScrollTop : 0,

  maxScrollLeft: 0,

  pagesCount: 0,

  pageIndex: 0,

  // The factor that amplifies or decrease the post touch speed.
  // The bigger, the faster scrolling is.
  _SPEED_FACTOR: UserAgent.IS_ANDROID ? 0.96 : 0.96,

  // The max interval between two consecutive touchmoves.
  _MAX_TOUCH_MOVE_INTERVAL: 220,

  // The minimum distance required to start the scrolling.
  _SCROLL_START_DELTA : 1,

  // Duration of paging animation.
  _PAGING_DURATION: 250,

  // Duration of post-touch scrolling animation.
  _SCROLLING_DURATION: UserAgent.IS_ANDROID ? 800 : 1200,

  // The factor that builds the tension when scrolling nearby tension points
  // (e.g. page top). Bigger value shall result in stronger tension. Value
  // must be between 0 and 1.
  _TENSION_FACTOR: UserAgent.IS_ANDROID ? 0.7 : 0.75,

  // The maximum distance that user can scroll from the tension point.
  // A typical tension point is the point at minScrollTop or maxScrollTop.
  _TENSION_LIMIT: 30,

  // The factor that determine how far the inertial scrolling can move from
  // the tension point then bounce back. The bigger the value is, the further
  // the bouncing distance is. Value must be between 0 and 1.
  _BOUNCE_FACTOR: 0.25,

  // Max scroll speed.
  _MAX_SPEED: UserAgent.IS_ANDROID ? 0.6 : UserAgent.IS_IPAD ? 4 : 0.8,

  /**
   * An Object that implements these methods:
   * {
   *   onScrollStart: function(left, top) {},
   *   onScroll: function() {left, top},
   *   onScrollEnd: function(left, top) {},
   * }
   */
  _hanlder: null,

  /**
   * @param {number} width
   * @param {number} height
   * @param {number} contentWidth
   * @param {number} contentHeight
   */
  setDimensions: function(width, height, contentWidth, contentHeight) {
    var scrollW = contentWidth < width ? width : contentWidth;
    var scrollH = contentHeight < height ? height : contentHeight;
    if (this._usePaging) {
      scrollW = width * Math.ceil(scrollW / width);
      scrollH = height * Math.ceil(scrollH / height);
    }
    this.scrollWidth = scrollW;
    this.scrollHeight = scrollH;
    this.width = width;
    this.height = height;
    this.maxScrollTop = scrollH - height;
    this.maxScrollLeft = scrollW - width;

    this._syncPaging();
  },

  doTouchStart: function(event) {
    this._setAncestorDisabled(true);

    if (this._disabled) {
      return;
    }

    if (this.scrolling) {
      this._animator.stop();
      this.scrolling = false;
    }

    this._moveCoordStart = TouchHelper.getTouchPageCoord(event);
    this._startX = this.left;
    this._startY = this.top;
    this._startDirection = null;
    this._touchMoved = false;
    this._scrolled = false;
    this._skipTouchMove = false;
  },

  doTouchMove: function(event) {
    if (!this._moveCoordStart || this._skipTouchMove || this._disabled) {
      return;
    }

    var moveCoord = TouchHelper.getTouchPageCoord(event);
    var now = Date.now();

    if (this.scrolling) {
      // Previous touchmove timestamp.
      this._moveTimePrevious = this._moveTimeNow;

      // Current touchmove timestamp.
      this._moveTimeNow = now;

      if (!this._moveCoordNow) {
        return;
      }

      if (moveCoord.y === this._moveCoordNow.y &&
        moveCoord.x === this._moveCoordNow.x) {
        return;
      }
    }

    var coordStart = this._moveCoordStart;
    var dx = coordStart.x - moveCoord.x;
    var dy = coordStart.y - moveCoord.y;

    this._touchMoved = true;

    if (!this.scrolling) {
      var absDx = Math.abs(dx);
      var absDy = Math.abs(dy);

      if (absDx > this._SCROLL_START_DELTA ||
        absDy > this._SCROLL_START_DELTA) {
        // Touch has moved far enough.

        var canScroll = (this._canScrollX && absDx > absDy) ||
          (this._canScrollY && absDy > absDx);

        if (canScroll) {
          this._startDirection = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';

          this.scrolling = true;
          // Current touchmove coordinate.
          this._moveCoordStart = moveCoord;
          // Current touchmove coordinate.
          this._moveCoordNow = moveCoord;
          // Current touchmove time.
          this._moveTimeNow = now;
          event.preventDefault();
        } else {
          // Touch has moved far enough, but the move direction is wrong.
          // We shall drop the following touchmove and let the native page
          // scrolling do its own work.
          this._skipTouchMove = true;
        }
      }

      return;
    }

    // Then prevent the page from scrolling.
    event.preventDefault();

    if (this._startDirection === 'x' && !this._canScrollX ||
      this._startDirection === 'y' && !this._canScrollY) {
      // Disable free-direction scrolling.
      return;
    }

    if (!this._scrolled) {
      this._scrolled = true;
      this._handler.onScrollStart(this.left, this.top);
    }

    // Previous touchmove coordination.
    this._moveCoordPrevious = this._moveCoordNow;

    // Current touchmove coordination.
    this._moveCoordNow = moveCoord;

    dx = this._canScrollX ? dx : 0;
    dy = this._canScrollY ? dy : 0;

    var tensionFactor = this._TENSION_FACTOR;
    var tensionLimit = this._TENSION_LIMIT;
    var tensionPercent;
    var tensionDelta;

    var x1 = this._startX + dx;
    if (this._canScrollX && !this._usePaging) {
      // Reduce the scrolling distance if reaches beyond scrolling limit.
      if (x1 < this.minScrollLeft) {
        tensionDelta = x1 - this.minScrollLeft;
      } else if (x1 > this.maxScrollLeft) {
        tensionDelta = x1 - this.maxScrollLeft;
      }
      if (tensionDelta) {
        tensionPercent = Math.min(1, Math.abs(tensionDelta) / tensionLimit);
        tensionPercent = (1 - Math.cos(tensionPercent * Math.PI / 2));
        x1 -= tensionDelta * Math.pow(tensionFactor, ~~(tensionPercent * 10));
      }
      // Reset it.
      tensionDelta = null;
    }

    var y1 = this._startY + dy;
    if (this._canScrollY && !this._usePaging) {
      // Reduce the scrolling distance if reaches beyond scrolling limit.
      if (y1 < this.minScrollTop) {
        tensionDelta = y1 - this.minScrollTop;
      } else if (y1 > this.maxScrollTop) {
        tensionDelta = y1 - this.maxScrollTop;
      }
      if (tensionDelta) {
        tensionPercent = Math.min(1, Math.abs(tensionDelta) / tensionLimit);
        tensionPercent = (1 - Math.cos(tensionPercent * Math.PI / 2));
        y1 -= tensionDelta * Math.pow(tensionFactor, ~~(tensionPercent * 10));
      }
    }

    this._scrollTo(x1, y1);
  },

  doTouchEnd: function(event) {
    this._setAncestorDisabled(false);

    if (this._disabled) {
      return;
    }

    if (!this._moveCoordStart) {
      return;
    }

    if (this.scrolling) {
      event.preventDefault();
    }

    var speed = 0;
    var moveDelta = 0;
    var moveCoordPrevious = this._moveCoordPrevious;
    var moveCoordStart = this._moveCoordStart;
    var moveCoordNow =
      this._moveCoordNow || moveCoordPrevious || moveCoordStart;

    // Current position.
    var p0 = this._canScrollX ? this.left : this.top;

    // Target end position.
    var p1;

    // Actual end position (after bouncing, if necessary).
    var p2;

    var duration = this._SCROLLING_DURATION;
    var timeDelta = Date.now() - this._moveTimePrevious;

    if (this._usePaging) {
      // For paging, the duration is fixed and faster than MIN_ANIM_DURATION.
      this._syncPaging();

      duration = this._PAGING_DURATION;

      var indexDelta = 0;

      if (this._touchMoved) {
        if (this._canScrollX) {
          indexDelta = moveCoordNow.x > moveCoordStart.x ? 0 : 1;
        } else {
          indexDelta = moveCoordNow.y > moveCoordStart.y ? 0 : 1;
        }
      }

      var index = this.pageIndex + indexDelta;
      index = this._clamp(index, 0, this.pagesCount - 1);

      if (this._canScrollX) {
        p1 = this._clamp(
          index * this.width,
          this.minScrollLeft,
          this.maxScrollLeft
        );
      } else {
        p1 = this._clamp(
          index * this.height,
          this.minScrollTop,
          this.maxScrollTop
        );
      }
    } else if (this._touchMoved &&
      timeDelta < this._MAX_TOUCH_MOVE_INTERVAL) {
      // For inertial scrolling.
      moveDelta = this._canScrollX ?
        moveCoordPrevious.x - moveCoordNow.x :
        moveCoordPrevious.y - moveCoordNow.y;

      speed = moveDelta / timeDelta;
    } else {
      // For a TAP (CLICK).
      if (this.top < this.minScrollTop) {
        p1 = this.minScrollTop;
      } else if (this.top > this.maxScrollTop) {
        p1 = this.maxScrollTop;
      } else if (this.left < this.minScrollLeft) {
        p1 = this.minScrollLeft;
      } else if (this.left > this.maxScrollLeft) {
        p1 = this.maxScrollLeft;
      }

      if (p1 !== undefined) {
        // There was no scrolling (because user might have interrupted one),
        // but we still need to scroll to a right position.
        this.scrolling = true;
        duration = this._PAGING_DURATION;
      }
    }

    speed = this._clamp(speed, -this._MAX_SPEED, this._MAX_SPEED);

    this._doPostTouchScrolling(p0, p1, p2, speed, duration);
    delete this._moveCoordStart;
  },

  /**
   * Programmatically set the scroll positions. Any exiting scrolling actions
   * will be stopped.
   * @param {number} left
   * @param {number}
    * @param {boolean=} opt_animating
   */
  scrollTo: function(left, top, opt_animating) {
    this._animator.stop();
    this.scrolling = false;
    delete this._moveCoordStart;
    if (!opt_animating) {
      this._handler.onScrollStart(this.left, this.top);
      this._scrollTo(left, top);
      this._handler.onScrollEnd(this.left, this.top);
    } else {
      var x0 = this.left;
      var x1 = left;
      var dx = x1 - x0;
      var y0 = this.top;
      var y1 = top;
      var dy = y1 - y0;
      this.scrolling = true;

      var step = this._canScrollX ?
        this.bind(function(percent) {
          var left = x0 + percent * dx;
          this._scrollTo(left, y0);
        }) :
        this.bind(function(percent) {
          var top = y0 + dy * percent;
          this._scrollTo(x0, top);
        });

      var complete = this.bind(function() {
        this._handler.onScrollEnd(this.left, this.top);
        x0 = null;
        x1 = null;
        y0 = null;
        y1 = null;
        dx = null;
        dy = null;
      });

      this._handler.onScrollStart(this.left, this.top);
      this._animator.start(
        step,
        this._canAnimate,
        complete,
        500
      );
    }
  },

  /**
   * @param {Element} element
   */
  registerElement :  function(element) {
    elementToScrollerMap.add(element, this);
    scrollerToElementMap.add(this, element);
  },

  /**
   * @param {number} p0 Start position.
   * @param {number=} p1 Target end position.
   * @param {number=} p2 Actual end position (after bouncing, if necessary).
   * @param {number} speed
   * @param {number} duration
   */
  _doPostTouchScrolling: function(p0, p1, p2, speed, duration) {
    // Adjust the speed.
    speed *= this._SPEED_FACTOR;

    if (p1 === undefined) {
      p1 = p0 + speed * duration;

      if (this._canScrollX) {
        p2 = this._clamp(p1, this.minScrollLeft, this.maxScrollLeft);
      } else {
        p2 = this._clamp(p1, this.minScrollTop, this.maxScrollTop);
      }

      if (p1 !== p2) {
        p1 = p2 + (p1 - p2) * this._BOUNCE_FACTOR /
          Math.max(1, Math.abs(speed));
      }

      if ((p1 < p0 && p2 < p1) || (p1 > p0 && p2 > p1)) {
        p1 = p2;
      }
    }

    if (p2 === undefined) {
      p2 = p1;
    }

    if (p1 === p0 && p1 === p2) {
      return;
    }

    var scrollTo = this._canScrollX ?
      function(left) {
        this._scrollTo(left, this.top);
      } :
      function(top) {
        this._scrollTo(this.left, top);
      };

    var stepFn = this._createStepFunction(p0, p1, p2,
      function(value, percent) {
        this.scrolling = percent < 1;
        scrollTo.call(this, value);
      });

    this._animator.start(
      stepFn,
      this._canAnimate,
      stepFn,
      duration
    );
  },

  /**
   * @param {number} p0 Start position.
   * @param {number} p1 Target end position.
   * @param {number} p2 Actual end position (after bouncing, if necessary).
   * @param {Function} callback The callback function for each step.
   * @return {Function}
   */
  _createStepFunction : function(p0, p1, p2, callback) {
    p1 = p1 === undefined ? p0 : p1;
    p2 = p2 === undefined ? p1 : p2;

    var positionDelta = p1 - p0;
    var bounceDelta = p2 - p1;

    return this.bind(function(percent, animating, timestamp) {
      var value;
      if (bounceDelta === 0) {
        // No need for bouncing.
        value = p0 + positionDelta * percent;
      } else {
        // Will bounce back when percent > 0.5.
        if (percent <= 0.5) {
          value = p0 + positionDelta * (percent / 0.5);
        } else {
          value = p1 + bounceDelta * ((percent - 0.5) / 0.5);
        }
      }

      callback.call(this, value, percent);

      if (!animating) {
        this._handler.onScrollEnd(this.left, this.top);
      }
    });
  },

  /**
   * @param {number} left
   * @param {number} top
   */
  _scrollTo: function(left, top) {
    left = Math.round(left);
    top = Math.round(top);

    if (this.left !== left || this.top !== top) {
      this.left = left;
      this.top = top;
      this._syncPaging();
      this._handler.onScroll(left, top);
    }
  },

  _syncPaging: function() {
    if (!this.width || !this.height) {
      this.pageIndex = 0;
      this.pagesCount = 0;
      return;
    }

    if (this._usePaging) {
      this.pageIndex = this._canScrollX ?
        Math.floor(this.left / this.width) :
        Math.floor(this.top / this.height);

      this.pagesCount = this._canScrollX ?
        Math.ceil(this.scrollWidth / this.width) :
        Math.ceil(this.scrollHeight / this.height);
    }
  },


  /**
   * @type {boolean}
   */
  _disabled: false,

  /**
   * @return {boolean}
   */
  _canAnimate: function() {
    return this.scrolling;
  },

  /**
   * @param {boolean} disabled
   */
  _setAncestorDisabled: function(disabled) {
    if (elementToScrollerMap.getSize() > 1) {
      var element = scrollerToElementMap.get(this);
      var node = element && element.parentNode;

      while (node) {
        var scroller = elementToScrollerMap.get(node);
        if (scroller) {
          if (disabled) {
            if (scroller._canScrollX && this._canScrollX ||
              scroller._canScrollY && this._canScrollY) {
              scroller._disabled = true
            }
          } else {
            scroller._disabled = false;
          }
        }
        node = node.parentNode;
      }
    }
  },

  /**
   * Clamp the value of a number.
   * @param {number} value
   * @param {number} min
   * @param {number} max
   * @return {number}
   */
  _clamp: function(value, min, max) {
    return value < min ?
      min :
      value > max ?
        max :
        value;
  }
});

Scroller.OPTION_HORIZONTAL = {
  direction:'horizontal'
};

Scroller.OPTION_PAGING_HORIZONTAL = {
  direction:'horizontal',
  paging: true
};

exports.Scroller = Scroller;