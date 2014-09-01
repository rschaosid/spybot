module.exports = function HumanPlayer(interface) {
  var that = this;
  this.units = [];
  this.active_units = {};

  this.getMove = function(cb) {
    interface.getMove(cb);
  };
  
  this.transferControl = function () {
    for (var uid in that.units) {
      that.active_units[uid] = that.units[uid];
    }

    interface.transferControl(that);
  };

  this.nextUnit = function() {
    var uids = Object.keys(that.active_units);
    if (uids.length < 1) {
      throw new Error('No more active units.');
    } else {
      return that.active_units[uids[0]];
    }
  };

  this.destroyUnit = function(unit) {
    delete that.active_units[unit.uid];
    delete that.units[unit.uid];
  }

  this.retireUnit = function (unit) {
    delete that.active_units[unit.uid];
  };

  this.addUnit = function (unit) {
    that.units[unit.uid] = unit;
  };
};
