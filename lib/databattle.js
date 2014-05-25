var Cell = require('./cell.js');

module.exports = function Databattle() {
  var that = this;

  //
  // notifies onChange listeners
  //

  var notifyChange = (function() {
    var listeners = [];
    that.onChange = Array.prototype.push.bind(listeners);
    return function() {
      listeners.forEach(function(l) {l();});
    };
  })();

  this.cells = new Array(13);
  for (var i = 0; i < 13; i++) {
    this.cells[i] = new Array(16);
  }

  this.getBoard = function() {
    var result = new Array(13);

    for (var x = 0; x < 13; x++) {
      result[x] = new Array(16);
      for (var y = 0; y < 16; y++) {
        result[x][y] = this.cells[x][y].copy();
      }
    }

    return {cells: result};
  };

  for (var x = 0; x < 13; x++) {
    for (var y = 0; y < 16; y++) {
      this.cells[x][y] = new Cell(true);
    }
  }

  this.addUnit = function(unit, posX, posY) {
    this.cells[posX][posY].occupier = unit.UID;
    unit.pos.x = posX;
    unit.pos.y = posY;
    unit.size = 1;
    unit.trail.add(unit.pos);
  };

  function withinRange(unit, action, target) {
    var dist = Math.abs(unit.pos.x - target.x) + Math.abs(unit.pos.y - target.y);
    return (dist > action.range);
  }


  this.validateStep = function(unit, target) {
    var grid = that.getBoard();
    var dist = Math.abs(target.x - unit.pos.x) + Math.abs(target.y - unit.pos.y);
    if (dist > 1) {
      return false;
    }

    var occupier = grid.cells[target[0]][target[1]].occupier;
    if ((occupier != null) && (occupier.UID != unit.UID)) {
      return false;
    }

    return grid.cells[target.x][target.y].passable;
  };

  this.performAction = function(action) {
    var loc = action.loc,
        target = that.cells[loc.x][loc.y].occupier;
    switch (action.type) {
    case 'damage':
      if (!target) {
        throw new Error('Invalid attack target.');
      }
      else {
        var res = target.damage(action.magnitude);
        for (var i = 0; i < res.positions.length; i++) {
          var rmX = res.positions[i].x;
          var rmY = res.positions[i].y;
          this.cells[rmX][rmY].occupier = null;
        }
      }
      break;
    case 'heal': throw new Error('Unimplemented');
    }
  };

  /* jshint unused: false */
  function doNextMove() {
    var whoeversTurnItIs; // this represents the current player object
    whoeversTurnItIs.getMove(function(action) {
      switch (action.type) {
      case 'step':
        if (!this.validateStep(action.unit, action.target)) {
          throw new Error('Invalid step.');
        }
        action.unit.step(action.target, that);
        return;
      case 'attack':
        if (withinRange(action.unit, action.action, action.target)) {
          that.performAction(action);
        }
        break;
      case 'move':
        break;
      case 'turn':
        break;
      }
      notifyChange();
    });
  }
};
