/**
 * @fileOverview Tappable
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Events = require('jog/events').Events;
var HashSet = require('jog/hashset').HashSet;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var tappedElement = null;
var pressedElement = null;

/**
 * Fires events "tapstart, tapend, tap, dbltap, tapin, tapout, tapclick"
 */
var Tappable = Class.create(EventTarget, {
  /**
   * @param {Element} ele
   */
  main: function(ele) {
    this._element = ele;
    this._events = new Events(this);
    this._targets = new HashSet();
    this._tapClick = this.bind(this._tapClick);
    this._events.listen(
      this._element, TouchHelper.EVT_TOUCHSTART, this._onTouchStart);
  },

  dispose: function() {
    this._targets.dispose();
    this._events.dispose();
  },

  /**
   * @param {Element} element
   */
  tap: function(element) {
    if (this._targets.contains(element)) {
      if (tappedElement === element) {
        return;
      }

      if (tappedElement) {
        this.dispatchEvent('tapout', tappedElement);
      }
      tappedElement = element;
      this.dispatchEvent('tapstart', element);
      this.dispatchEvent('tapend', element);
      this.dispatchEvent('tap', element, false, element);
      this.dispatchEvent('tapin', element);
      this.dispatchEvent('tapclick', element, false, element);
    }
  },

  /**
   * @param {Element} element
   * @return {Tappable}
   */
  addTarget: function(element) {
    this._targets.add(element);
    element._tappaple = true;
    return this;
  },

  /**
   * @param {Event} event
   */
  _onTouchStart: function(event) {
    delete this._tapStartNode;
    delete this._movedCount;

    if (this._tapClickTimer) {
      clearTimeout(this._tapClickTimer);
      this._tapClickTimer = undefined;
      this._tapClickNode = undefined;
    }

    if (event.defaultPrevented || this._targets.getSize() == 0) {
      return;
    }

    var target = event.target;
    if (target === this._element || this._element.contains(target)) {

      while (target) {
        if (target._tappaple) {
          if (this._targets.contains(target)) {
            var doNotPrevent = target.tagName === 'INPUT' ||
              target.querySelector('input');

            if (!doNotPrevent) {
              event.preventDefault();
            }

            this.dispatchEvent('tapstart', target);
            pressedElement = target;
            dom.addClassName(pressedElement, cssx('tap-pressed'));

            this._tapStartNode = target;

            this._events.unlistenAll();
            this._events.listen(
              document, TouchHelper.EVT_TOUCHMOVE, this._onTouchMove);
            this._events.listen(
              document, TouchHelper.EVT_TOUCHEND, this._onTouchEnd);
            this._events.listen(
              document, TouchHelper.EVT_TOUCHCANCEL, this._onTouchEnd);
          }
          break;
        }
        target = target.parentNode;
      }
    }

    if (tappedElement) {
      if (this._tapStartNode) {
        if (tappedElement !== this._tapStartNode &&
          !tappedElement.contains(this._tapStartNode)) {
          this.dispatchEvent('tapout', tappedElement);
        }
      } else {
        this.dispatchEvent('tapout', tappedElement);
      }
      tappedElement = null;
    }
  },


  /**
   * @param {Event} event
   */
  _onTouchMove: function(event) {
    this._movedCount++;
    if (pressedElement && this._movedCount > 5) {
      dom.removeClassName(pressedElement, cssx('tap-pressed'));
      pressedElement = undefined;
    }
  },

  /**
   * @param {Event} event
   */
  _onTouchEnd: function(event) {
    this._events.unlistenAll();

    var touchTarget = this._tapStartNode;
    var tapped;
    var dbltapped;

    if (pressedElement) {
      dom.removeClassName(pressedElement, cssx('tap-pressed'));
      pressedElement = undefined;
    }

    if (!event.defaultPrevented && touchTarget && this._movedCount < 1) {
      var target = event.target;
      if (touchTarget == target || touchTarget.contains(target)) {
        if (this._tappedTarget === touchTarget &&
          (Date.now() - this._tappedTime) < 350) {
          dbltapped = true;
          delete this._tappedTarget;
          delete this._tappedTime;
        } else {
          this._tappedTarget = this._tapStartNode;
          this._tappedTime = Date.now();
        }
        tapped = true;
      }
    }

    if (tapped) {
      // event.preventDefault();
      tappedElement = touchTarget;
      this.dispatchEvent('tapend', touchTarget);
      this.dispatchEvent('tap', touchTarget, false, target);
      this.dispatchEvent('tapin', touchTarget);
      if (dbltapped) {
        this.dispatchEvent('dbltap', touchTarget);
      }
    } else {
      this.dispatchEvent('tapend', touchTarget);
    }

    delete this._tapStartNode;

    this._events.listen(
      this._element,
      TouchHelper.EVT_TOUCHSTART,
      this._onTouchStart);

    if (tapped) {
      this._tapClickNode = touchTarget;
      this._tapClickOriginalNode = target;
      this._tapClickTimer = this.setTimeout(this._tapClick, 120);
    }
  },

  _tapClick: function() {
    if (this._tapClickNode) {
      this.dispatchEvent(
        'tapclick', this._tapClickNode, false, this._tapClickOriginalNode);
      this._tapClickNode = undefined;
      this._tapClickTimer = undefined;
      this._tapClickOriginalNode = undefined;
    }
  },

  _tapClickTimer: 0,

  /**
   * @type {Element}
   */
  _tapStartNode: null,

  /**
   * @type {Element}
   */
  _tapClickOriginalNode:null,

  /**
   * @type {Element}
   */
  _tapClickNode: null,

  /**
   * @type {Element}
   */
  _tappedTarget: null,

  /**
   * @type {number}
   */
  _tappedTime: 0,

  /**
   * @type {HashSet}
   */
  _targets: null,

  /**
   * @type {Element}
   */
  _element : null,

  /**
   * @type {number}
   */
  _movedCount: 0,

  /**
   * @type {Events}
   */
  _events: null
});

exports.Tappable = Tappable;
