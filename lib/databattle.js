var mod = require('mod-loop');

function distance(from, to) {
  return Math.abs(~~(from/16) - ~~(to/16)) + Math.abs(mod(from,16) - mod(to,16));
}

var Databattle = module.exports = function Databattle(level, players) {
  var that = this;

  var cells, units;

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
        hasUnitHead: false,
        hasUnitTail: false
      };

      Object.keys(units).some(function(uid) {
        uid = parseInt(uid);
        if(-1 < units[uid].sectors.indexOf(i)) {
          newCells[i].occupant = uid;
          newCells[i].hasUnitHead = units[uid].sectors[0] === i;
          newCells[i].hasUnitTail = units[uid].sectors[units[uid].sectors.length-1] === i;
          return true;
        }
      });
    }
    cells = newCells;
  }

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
    console.log(unit);
    // remove target from sector list if it's already there
    unit.sectors = unit.sectors.filter(function(sector) {
      return sector !== target;
    });

    // prepend target to sector list
    unit.sectors.unshift(target);

    // remove last sector if unit is too long
    if(unit.sectors.length > unit.maxSize) {
      unit.sectors.pop();
    }
    refreshCellView();
  }

  function validateAttack(uid, attack, target) {
    var unit = units[uid];
    var pos = unit.sectors[0];
    var posx = pos % 16;
    var posy = (pos - posx) / 16;
    var targetx = target % 16;
    var targety = (target - targetx) / 16;
    return Math.abs(posx - targetx) + Math.abs(posy - targety) <= attack.range;
  }

  function doAttack(uid, attack, target) {
    if(attack.type !== 'damage') {
      throw new Error('not implemented');
    }
    if(!validateAttack(uid, attack, target)) {
      throw new Error('Invalid attack');
    }
    var tgt = cells[target];
    inflictDamage(units[tgt.occupant], attack.magnitude);
    refreshCellView();
  }

  function inflictDamage(victim, magnitude) {
    var damage = magnitude;
    if (magnitude >= victim.sectors.length) {
      damage = victim.sectors.length;
      players[victim.alignment].destroyUnit(victim);
    }

    for(var i=0;i<damage;i++) {
      victim.sectors.pop();
    }
  }

  function applyAction(action) {
    switch (action.type) {
      case 'step':
        doStep(action.uid, action.target);
        break;
      case 'damage':
        doAttack(action.uid, action.attack, action.target);
        break;
      case 'turn':
        break;
    }
    notifyChange();
  }

  that.startGame = function() {
    function doMove(i) {
      players[i].transferControl();
      players[i].getMove(function(action) {
        applyAction(action);
        if(action.type === 'turn') {
          doMove(mod(i+1, players.length));
        }
      });
    }
    doMove(0);
  };

  cells = level.cells;
  Object.defineProperty(that, 'cells', {
    enumerable: true,
    get: function() {
      return cells;
    }
  });

  units = that.units = [];
  level.units.forEach(function(unit) {
    units[unit.uid] = unit;
  });

  refreshCellView();
};

Databattle.distance = distance;
