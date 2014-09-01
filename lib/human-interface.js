var Databattle = require('./databattle.js');

var modes = {
  STEPPING: 'stepping',
  ATTACKING: 'attacking',
  IDLE: 'idle',
};

module.exports = function HumanInterface(el_root) {
  var that = this;
  var mode = null;
  var move = null;
  var action = null;
  var controller = null;
  var focused_unit = null;
  var action_callback = null;
  var head_listeners = [];
  var action_bar = null;
  var cells = null;
  var el_board = null;
  var el_cells = null;
  var databattle = null;

  this.initialize = function(game, player) {
    controller = player;
    databattle = game;

    var el_backdrop = document.createElement('spybot-databattle-backdrop');
    el_backdrop.setAttribute('spybot-databattle-backdrop-kind', databattle.backdrop || 3);
    el_root.appendChild(el_backdrop);
    
    action_bar = new ActionBar(this);

    el_root.appendChild(action_bar.action_overlay);

    cells = new Array(13*16);
    for(var i=0; i<16*13; i++) { cells[i] = {}; }

    el_board = document.createElement('spybot-databattle-board');
    el_cells = generateCells(el_board);

    el_root.appendChild(el_board);

    databattle.onChange(updateDOM);

    that.getMove = function(cb) {
      action_callback = cb;
      move = new MoveObject(focused_unit, action_callback, that);
      updateDOM();
    };
  };

  function updateDOM () {
    var newCells = databattle.cells;

    /* remove existing overlays */
    removeCellOverlays(el_board);

    action_bar.update_buttons(focused_unit);

    for (var i = 0; i < 16*13; i++) {
      var el_cell = el_cells[i];
      var oldCell = cells[i];
      var newCell = newCells[i];

      // passability has changed
      updatePassability(el_cell, oldCell, newCell);

      /* if occupancy has changed */
      updateOccupancy(el_cell, oldCell, newCell, databattle);

      /* if unit-head status has changed */
      updateUnitHeads(el_cell, oldCell, newCell, i, changeFocus, head_listeners, databattle.units);
    }

    if (mode == modes.STEPPING) {
      addStepExtents(databattle, move, el_cells, newCells);
      addStepDirections(focused_unit, newCells, el_cells, move);
    } else if (mode == modes.ATTACKING) {
      addAttackOverlay(action, focused_unit, el_cells, newCells, that, head_listeners, action_callback);
    }

    cells = newCells;
  }

  this.finalizeMove = function () {
    controller.retireUnit(focused_unit);
    try {
      focused_unit = controller.nextUnit();
    } catch (e) {
      action_callback({ type: 'turn' });
      //mode = modes.IDLE;
      updateDOM();
      return;
    }

    if (focused_unit.moveRate > 0) {
      mode = modes.STEPPING;
      move = new MoveObject(focused_unit, action_callback, that);
    } else {
      that.attackMode(null);
    }
    updateDOM();
  };


  this.transferControl = function(player) {
    mode = modes.STEPPING;
    controller = player;
    focused_unit = controller.nextUnit();
  };

  this.attackMode = function(attack) {
    mode = modes.ATTACKING;
    if (attack == null) {
      action = focused_unit.attacks[0];
    } else {
      action = attack;
    }
    updateDOM();
  };

  var changeFocus = function(unit) {
    focused_unit = unit;
  };
};

function MoveObject(unit, callback, interface) {
  var that = this;
  this.uid = unit.uid;
  this.remaining = unit.moveRate;
  this.type = 'step';
  this.step = function(target) {
    try {
      that.target = target;
      that.remaining--;
      callback(that);
    } catch(e) {
      that.remaining++;
    }

    if (that.remaining === 0) {
      interface.attackMode(null);
    }
  };
}

function addAttackOverlay(action, unit, el_cells, cells, hInt, head_listeners, action_cb) {
  if (!action) {
    return;
  }

  var extent = action.range;
  var head_sector = unit.sectors[0];
  var headX = head_sector % 16;
  var headY = (head_sector - headX) / 16;

  function addAttackOverlay(pos) {
    var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
    el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'attack-overlay');
    el_cells[pos].appendChild(el_overlay);

    var onClick = function() {
      var listener = head_listeners[pos];
      if (typeof listener !== 'undefined') {
        listener.suspended = true;
      }
      
      var move = {
        type: 'damage',
        attack: action,
        uid: unit.uid,
        target: pos
      };

      try {
        action_cb(move);
        hInt.finalizeMove();
      } catch (e) {

      }
    };

    // Register onClick during the capture phase
    el_overlay.addEventListener('click', onClick, true);
  }

  function validTarget(pos) {
    return ((pos < 13*16) &&
        (pos >= 0) &&
        (unit.sectors.indexOf(pos) == -1) &&
        (Boolean(cells[pos].passable)));
  }

  var rowLength = 0;
  for (var y = (headY + extent); y >= (headY - extent); y--) {
    for (var x = headX - rowLength; x <= headX + rowLength; x++) {
      var pos = 16*y + x;
      if (validTarget(pos)) {
        addAttackOverlay(pos);
      }
    }

    if (y > headY) {
      rowLength++;
    } else {
      rowLength--;
    }
  }
}


function addStepDirections(unit, cells, el_cells, move) {
  if (move) {
    var head = unit.sectors[0];
    stepPointerOverlay(head-1, 'left');
    stepPointerOverlay(head+1, 'right');
    stepPointerOverlay(head-16, 'up');
    stepPointerOverlay(head+16, 'down');
  }

  function stepPointerOverlay(target, direction) {
    if (!Boolean(cells[target].passable)) {
      return;
    }
    var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
    el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-pointer');
    el_overlay.setAttribute('spybot-databattle-board-cell-overlay-step-pointer-direction', direction);
    el_overlay.addEventListener('click', function() {
      move.step(target);
    });
    el_cells[target].appendChild(el_overlay);
  }
}

function generateCells(el_board) {
  var el_cells = [];
  for (var i = 0; i < 13; i++) {
    var el_row = document.createElement('tr');
    for(var j = 0; j < 16; j++) {
      var el_cell = document.createElement('spybot-databattle-board-cell');
      el_row.appendChild(el_cells[16*i+j] = el_cell);
    }
    el_board.appendChild(el_row);
  }
  return el_cells;
}

function removeCellOverlays(el_board) {
  Array.prototype.slice.call(
      el_board.getElementsByTagName('spybot-databattle-board-cell-overlay')).forEach(function(e) {
    e.parentNode.removeChild(e);
  });
}

function ActionBar(interface) {
  var that = this;
  that.action_overlay = document.createElement('spybot-databattle-action-board');
  var no_action_button = document.createElement('spybot-databattle-board-cell');
  that.action_overlay.appendChild(no_action_button);
  no_action_button.addEventListener('click', function () {
    interface.finalizeMove();
  });

  var action_buttons = [];

  that.update_buttons = function(unit) { 
    action_buttons.map(function (el) { el.parentNode.removeChild(el); });
    action_buttons = [];
    function add_button(action) {
      var action_cell = document.createElement('spybot-databattle-board-cell');
      var action_cell_background = document.createElement('spybot-databattle-board-cell-floor');
      action_cell_background.setAttribute('spybot-databattle-board-cell-floor-tiletype', 2);
      action_cell.appendChild(action_cell_background);
      var onClick = function () {
        interface.attackMode(action);
      };
      action_cell.addEventListener('click', onClick);
      that.action_overlay.appendChild(action_cell);
      action_buttons.unshift(action_cell);
    }

    unit.attacks.map(add_button);
  };
}


function updatePassability(el_cell, oldCell, newCell) {
  if (Boolean(oldCell.passable) !== Boolean(newCell.passable)) {
    if (newCell.passable) {
      var el_floor = document.createElement('spybot-databattle-board-cell-floor');
      el_floor.setAttribute('spybot-databattle-board-cell-floor-tiletype', 1);
      el_cell.appendChild(el_floor);
    }
    else {
      el_cell.getElementsByTagName('spybot-databattle-board-cell-floor').forEach(function(el_floor) {
        el_cell.removeChild(el_floor);
      });
    }
  }
}


function updateUnitHeads(el_cell, oldCell, newCell, pos, changeFocus, head_listeners, units) {
  function UnitHeadHandler(unit) {
    var that = this;
    that.suspended = false;

    that.handler = function() {
      if (!that.suspended) {
        changeFocus(unit);
      } else {
        that.suspended = false;
      }
    };
  }

  function removeHeadListener() {
    var listener = head_listeners[pos];
    if (typeof listener != 'undefined') {
      el_cell.removeEventListener('click', listener.handler);
      head_listeners[pos] = undefined;
    }
  }

  function addHeadListener(uid) {
    var unit = units[uid];
    var listener = new UnitHeadHandler(unit, pos);
    head_listeners[pos] = listener;

    // Register the handler for the bubbling phase
    el_cell.addEventListener('click', listener.handler, false);
  }

  if (Boolean(oldCell.hasUnitHead) !== Boolean(newCell.hasUnitHead)) {
    if (newCell.occupant) {
      var el_sector = el_cell.getElementsByTagName('spybot-databattle-board-cell-sector')[0];
      if (newCell.hasUnitHead) {
        el_sector.classList.add('spybot-databattle-board-cell-sector-unit-head');
        addHeadListener(newCell.occupant);
      } else {
        el_sector.classList.remove('spybot-databattle-board-cell-sector-unit-head');
        removeHeadListener();
      }
    } else {
      removeHeadListener();
    }
  }
}

function updateOccupancy(el_cell, oldCell, newCell, databattle) {
  if ((oldCell.occupant !== newCell.occupant) && (oldCell.occupant || newCell.occupant)) {

    if (oldCell.occupant && !newCell.occupant) {
      /* Remove 'occupied' class */
      el_cell.classList.remove('spybot-databattle-board-cell-occupied');
    } 
    else if (!oldCell.occupant && newCell.occupant) {
      /* Add 'occupied' class */
      el_cell.classList.add('spybot-databattle-board-cell-occupied');
    }

    /* remove existing sector if necessary */
    if (oldCell.occupant) {
      Array.prototype.slice.call(el_cell.getElementsByTagName('spybot-databattle-board-cell-sector')).forEach(function(e) {
        e.parentNode.removeChild(e);
      });
    }

    /* add new sector if occupied and un/set class */
    if (newCell.occupant) {
      var el_sector = document.createElement('spybot-databattle-board-cell-sector');
      el_sector.setAttribute('spybot-databattle-unit-class', databattle.units[newCell.occupant].name);
      el_cell.appendChild(el_sector);
    }
  }  
}

function addStepExtents(databattle, move, el_cells, cells) {
  if (!move) {
    return;
  }

  var extent = move.remaining;
  var head_sector = databattle.units[move.uid].sectors[0];
  var headX = head_sector % 16;
  var headY = (head_sector - headX) / 16;

  function addStepOverlay(pos) {
    var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
    el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-extents');
    el_cells[pos].appendChild(el_overlay);
  }

  var rowLength = 0;
  for (var y = (headY + extent); y >= (headY - extent); y--) {
    for (var x = headX - rowLength; x <= headX + rowLength; x++) {
      var pos = 16*y + x;
      if ((pos > 0) && (pos !== head_sector) && (Boolean(cells[pos].passable))) {
        addStepOverlay(pos);
      }
    }

    if (y > headY) {
      rowLength++;
    } else {
      rowLength--;
    }
  }
}
