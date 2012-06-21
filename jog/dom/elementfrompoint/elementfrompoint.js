/**
 * Cross-OS implementation of elementFRomPoint.
 * @see http://www.icab.de/blog/2011/10/17/elementfrompoint-under-ios-5/
 * @fileOverview Imageable
 * @author Hedger Wang
 */


throw new Error('document.elementFromPoint is too buggy to be solved :-P');

var staticSharedCoord = {};

function documentCoordinateToViewportCoordinate(x, y) {
  staticSharedCoord.x = x - window.pageXOffset;
  staticSharedCoord.y = y - window.pageYOffset;
  return staticSharedCoord;
}

function viewportCoordinateToDocumentCoordinate(x, y) {
  staticSharedCoord.x = x + window.pageXOffset;
  staticSharedCoord.y = y + window.pageYOffset;
  return staticSharedCoord;
}

function elementFromPointIsUsingViewPortCoordinates() {
  if (window.pageYOffset > 0) {     // page scrolled down
    return (document.elementFromPoint(0, window.pageYOffset + window.innerHeight - 1) == null);
  } else if (window.pageXOffset > 0) {   // page scrolled to the right
    return (document.elementFromPoint(window.pageXOffset + window.innerWidth - 1, 0) == null);
  }
  return false; // no scrolling, don't care
}

//function elementFromDocumentPoint(x, y) {
//  if (elementFromPointIsUsingViewPortCoordinates()) {
//    var coord = documentCoordinateToViewportCoordinate(x, y);
//    return document.elementFromPoint(coord.x, coord.y);
//  } else {
//    return document.elementFromPoint(x, y);
//  }
//}
//
//function elementFromViewportPoint(x, y) {
//  if (elementFromPointIsUsingViewPortCoordinates()) {
//    return document.elementFromPoint(x, y);
//  } else {
//    var coord = viewportCoordinateToDocumentCoordinate(x, y);
//    return document.elementFromPoint(coord.x, coord.y);
//  }
//}

/**
 * @param {number} x
 * @param {number} y
 * @return {Element}
 */
function elementFromPoint(x, y) {
  if (elementFromPointIsUsingViewPortCoordinates()) {
    return document.elementFromPoint(x, y);
  } else {
    var coord = viewportCoordinateToDocumentCoordinate(x, y);
    return document.elementFromPoint(coord.x, coord.y);
  }
}

exports.elementFromPoint = elementFromPoint;