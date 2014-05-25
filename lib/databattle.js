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
  }

  for (var x = 0; x < 13; x++) {
    for (var y = 0; y < 16; y++) {
      this.cells[x][y] = new Cell(true);
    }
  }

  this.addUnit = function(unit, posX, posY) {
    this.cells[posX][posY].occupier = unit.UID;
    unit.pos = [posX, posY];
    unit.size = 1;
    unit.trail = new UnitTrail(null);
    unit.trail.add(unit.pos);
  };

  this.validateStep = function(unit, target) {
    var grid = that.getBoard();
    var dist = Math.abs(target[0] - unit.pos[0]) + Math.abs(unit[0] - target[0]);
    if (dist > 1) return false;

    var occupier = grid.cells[target[0]][target[1]].occupier;
    if ((occupier != null) && (occupier.UID != unit.UID)) return false;

    return grid.cells[target[0]][target[1]].passable;
  }

  function doNextMove() {
    var whoeversTurnItIs; // this represents the current player object
    whoeversTurnItIs.getMove(function(action) {
      switch (action.type) {
      case 'step':
        if (!validMovePosition(action.unit, action.target, grid))
          throw new Error('Invalid step.');
        break;
      case 'attack':
        var headPos = action.unit.
        break;
      case 'move':
        break;
      case 'turn':
        break;
      }
    });
  }
};
