/**
 * @fileOverview Tappable
 * @author Hedger Wang
 */

var Class = require('jog/class').Class;
var Events = require('jog/events').Events;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var HashSet = require('jog/hashset').HashSet;
var TouchHelper = require('jog/touchhelper').TouchHelper;

var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var tappedElement = null;

/**
 * Fires events "tapstart, tapend, tap, dbltap"
 */
var Tappable = Class.create(EventTarget, {
  /**
   * @param {Element} ele
   */
  main: function(ele) {
    this._element = ele;
    this._events = new Events(this);
    this._targets = new HashSet();
    this._events.listen(
      document, TouchHelper.EVT_TOUCHSTART, this._onTouchStart);
  },

  dispose: function() {
    this._targets.dispose();
    this._events.dispose();
  },

  /**
   * @param {Element} element
   */
  addTarget: function(element) {
    this._targets.add(element);
    element._tappaple = true;
  },

  /**
   * @param {Event} event
   */
  _onTouchStart: function(event) {
    delete this._tapStartNode;

    if (event.defaultPrevented || this._targets.getSize() == 0) {
      return;
    }

    var target = event.target;
    if (target === this._element || this._element.contains(target)) {

      while (target) {
        if (target._tappaple) {
          if (this._targets.contains(target)) {
            this.dispatchEvent('tapstart', target);

            this._tapStartNode = target;

            this._events.unlistenAll();

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
  _onTouchEnd: function(event) {
    this._events.unlistenAll();

    var touchTarget = this._tapStartNode;
    var tapped;
    var dbltapped;

    if (!event.defaultPrevented && touchTarget) {
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
      this.dispatchEvent('tapend', touchTarget);
      this.dispatchEvent('tap', touchTarget);
      this.dispatchEvent('tapin', touchTarget);
      tappedElement = touchTarget;
      if (dbltapped) {
        this.dispatchEvent('dbltap', touchTarget);
      }
    } else {
      this.dispatchEvent('tapend', touchTarget);
    }

    delete this._tapStartNode;

    this._events.listen(
      document,
      TouchHelper.EVT_TOUCHSTART,
      this._onTouchStart);
  },

  /**
   * @type {Element}
   */
  _tapStartNode: null,

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
   * @type {Events}
   */
  _events: null
});

exports.Tappable = Tappable;