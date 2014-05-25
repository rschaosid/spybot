var mod = require('mod-loop');

function distance(from, to) {
  return Math.abs(~~(from/16) - ~~(to/16)) + Math.abs(mod(from,16) - mod(to,16));
}

module.exports = function Databattle(level, players) {
  var that = this;

  var cells = level.cells;
  Object.defineProperty(that, 'cells', {
    enumerable: true,
    get: function() {
      return cells;
    }
  });

  var units = that.units = [];
  level.units.forEach(function(unit) {
    units[unit.uid] = unit;
  });

  //
  // computes the full immutable cell array view of the board
  // call when something changes (units or the backing cell array)
  //

  function refreshCellView() {
    var newCells = new Array(cells.length);
    for(var i=0;i<cells.length;i++) {
      newCells[i] = {
        tileType: cells[i].tileType,
        passable: cells[i].passable,
        hasDataCard: cells[i].hasDataCard,
        credit: cells[i].credit,
        occupant: units.filter(function(unit) {
          return (-1 < unit.sectors.indexOf(cells[i]));
        })[0] || null,
        hasUnitHead: units[cells[i].uid].sectors[0] === i,
        hasUnitTail: units[cells[i].uid].sectors[units[cells[i].uid].sectors.length-1] === i
      };
    }
    cells = newCells;
  }

  //
  // notifies onChange listeners
  // also call when something changes
  //

  var notifyChange = (function() {
    var listeners = [];
    that.onChange = Array.prototype.push.bind(listeners);
    return function() {
      listeners.forEach(function(l) {l();});
    };
  })();

  function validateStep(uid, target) {
    if (distance(units[uid].sectors[0], target) !== 1) {
      return false;
    }

    var occupant = cells[target].occupant;
    if (occupant && (occupant !== uid)) {
      return false;
    }

    return !!cells[target].passable;
  }

  function doStep(uid, target) {
    if(!validateStep(uid, target)) {
      throw new Error('Invalid step');
    }

    var unit = units[uid];
    unit.sectors.unshift(target);
    if(unit.sectors.length > unit.maxSize) {
      unit.sectors.pop();
    }
    refreshCellView();
  }

  function validateAttack(from, attack, target) {
    return from, attack, target, true; // TODO validate
  }

  function doAttack(from, attack, target) {
    if(attack.type !== 'damage') {
      throw new Error('not implemented');
    }
    if(!validateAttack(from, attack, target)) {
      throw new Error('Invalid attack');
    }
    inflictDamage(units[cells[target].occupant], attack.magnitude);
    refreshCellView();
  }

  function inflictDamage(victim, magnitude) {
    for(var i=0;i<magnitude;i++) {
      victim.sectors.pop();
    }
  }

  function applyAction(action) {
    switch (action.type) {
      case 'step':
        doStep(action.uid, action.target);
        break;
      case 'attack':
        doAttack(action.uid, action.attack, action.target);
        break;
      case 'move':
        break;
      case 'turn':
        break;
    }
    notifyChange();
  }

  that.startGame = function() {
    function doMove(i) {
      players[i].getMove(function(action) {
        applyAction(action);
        if(action.type === 'turn') {
          doMove(mod(i+1, players.length));
        }
      });
    }
    doMove(0);
  };
};
