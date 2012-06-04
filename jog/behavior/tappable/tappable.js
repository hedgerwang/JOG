/**
 * @fileOverview ScrollArea
 * @author Hedger Wang
 */

var Animator = require('jog/animator').Animator;
var Class = require('jog/class').Class;
var Events = require('jog/events').Events;
var EventTarget = require('jog/events/eventtarget').EventTarget;
var Scroller = require('jog/behavior/scrollable/scroller').Scroller;
var TouchHelper = require('jog/touchhelper').TouchHelper;
var cssx = require('jog/cssx').cssx;
var dom = require('jog/dom').dom;

var HasgMap = require('jog').HashCode
var Tappable = Class.create(EventTarget, {
  /**
   * @param {Element} element
   */
  main: function(element) {
    this._element = element;
    this._events = new Events(this);
  },
  _element : null,
  _events: null
});

exports.Tappable = Tappable;
