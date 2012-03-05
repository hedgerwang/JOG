/**
 * @fileOverview Events
 * @author Hedger Wang
 */

/**
 * @constructor
 */
function Disposable() {
  /**
   * @type {boolean}
   * @private
   */
  this._disposed = false;
}

/**
 * Dispose
 */
Disposable.prototype.dispose = function() {
  if (!this._disposed) {
    this._disposed = true;
    this.disposeInternal();
  }
};

/**
 * disposeInternal
 */
Disposable.prototype.disposeInternal = function() {
};


exports.Disposable = Disposable;