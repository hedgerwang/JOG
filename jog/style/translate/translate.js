var PROPERTY_TRANSFORM = 'webkitTransform';

var translate = {
  toX: function(element, x) {
    element.style[PROPERTY_TRANSFORM] = 'translate3d(' + x + 'px,0,0)';
  },

  toY: function(element, y) {
    element.style[PROPERTY_TRANSFORM] = 'translate3d(0,' + y + 'px,0)';
  },

  toXY: function(element, x, y) {
    element.style[PROPERTY_TRANSFORM] =
      'translate3d(' + x + 'px,' + y + 'px,0)';
  }
};

exports.translate = translate;