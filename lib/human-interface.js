var Databattle = require('./databattle.js');

module.exports = function HumanInterface(el_root) {
  var that = this;
  this.initialize = function(databattle) {
    var el_backdrop = document.createElement('spybot-databattle-backdrop');
    el_backdrop.setAttribute('spybot-databattle-backdrop-kind', databattle.backdrop || 3);
    el_root.appendChild(el_backdrop);
    
    var el_actionbar = document.createElement('spybot-databattle-action-board');
    el_root.appendChild(el_actionbar);

    var cells = new Array(13*16);
    for(var i=0; i<16*13; i++) { cells[i] = {}; }

    var el_board = document.createElement('spybot-databattle-board');
    
    var el_cells = generateCells(el_board);

    el_root.appendChild(el_board);

    databattle.onChange(updateDOM);

    function updateDOM() {
      var newCells = databattle.cells;

      /* remove existing overlays */
      removeOverlays(el_board);

      for(var i = 0; i < 16*13; i++) {
        var el_cell = el_cells[i];
        var oldCell = cells[i];
        var newCell = newCells[i];

        // passability has changed
        updatePassability(el_cell, oldCell, newCell);

        /* if occupancy has changed */
        updateOccupancy(el_cell, oldCell, newCell, databattle);

        /* if unit-head status has changed */
        updateUnitHeads(el_cell, oldCell, newCell);

        /* add step-extents overlay if square is reachable */
        addStepExtents(el_cell, databattle, move, i);
      }

      function stepPointerOverlay(target, direction) {
        if (!Boolean(newCells[target].passable)) return;
        var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
        el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-pointer');
        el_overlay.setAttribute('spybot-databattle-board-cell-overlay-step-pointer-direction', direction);
        el_overlay.addEventListener('click', function() {
          move.step(target);
        });
        el_cells[target].appendChild(el_overlay);
      }

      if (move) {
        var head = databattle.units[move.uid].sectors[0];
        stepPointerOverlay(head-1, 'left');
        stepPointerOverlay(head+1, 'right');
        stepPointerOverlay(head-16, 'up');
        stepPointerOverlay(head+16, 'down');
      }

      cells = newCells;
    }



    var move = null;
    that.getMove = function(cb) {
      move = {
        uid: 1,
        remaining: databattle.units[1].moveRate,
        step: function(target) {
          try {
            move.remaining--;
            cb({
              type: 'step',
              uid: move.uid,
              target: target
            });
          } catch(e) {
            move.remaining++;
          }

          if (move.remaining === 0) {
            move.uid++;
            if(move.uid <= 4) {
              move.remaining = databattle.units[move.uid].moveRate;
            }
            else {
              cb({type: 'turn'});
            }
            updateDOM();
          }
        }
      };
      updateDOM();
    };
  };
};

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

function removeOverlays(el_board) {
  Array.prototype.slice.call(el_board.getElementsByTagName('spybot-databattle-board-cell-overlay')).forEach(function(e) {
    e.parentNode.removeChild(e);
  });
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

function updateUnitHeads(el_cell, oldCell, newCell) {
  if (Boolean(oldCell.hasUnitHead) !== Boolean(newCell.hasUnitHead)) {
    if (newCell.occupant) {
      var el_sector = el_cell.getElementsByTagName('spybot-databattle-board-cell-sector')[0];
      if (newCell.hasUnitHead) {
        el_sector.classList.add('spybot-databattle-board-cell-sector-unit-head');
      } else {
        el_sector.classList.remove('spybot-databattle-board-cell-sector-unit-head');
      }
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

function addStepExtents(el_cell, databattle, move, pos) {
  if (!move) return;

  var reachable = Databattle.distance(pos, databattle.units[move.uid].sectors[0]) <= move.remaining;

  if (reachable && (pos !== databattle.units[move.uid].sectors[0]) && (databattle.cells[pos].passable)) {
    var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
    el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-extents');
    el_cell.appendChild(el_overlay);
  }
}
