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

var Tappable = Class.create(EventTarget, {
  /**
   * @param {Element} element
   */
  main: function(element) {
    this._element = element;
    this._events = new Events(this);
    this._targets = new HashSet();
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
  },

  _targets: null,
  _element : null,
  _events: null
});

exports.Tappable = Tappable;
