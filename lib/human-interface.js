var Databattle = require('./databattle.js');

module.exports = function HumanInterface(el_root) {
  var that = this;
  this.initialize = function(databattle) {
    var el_backdrop = document.createElement('spybot-databattle-backdrop');
    el_backdrop.setAttribute('spybot-databattle-backdrop-kind', databattle.backdrop || 3);
    el_root.appendChild(el_backdrop);
    var cells = new Array(13*16);
    for(var i=0; i<16*13; i++) { cells[i] = {}; }

    var el_cells = [];
    var el_board=document.createElement('spybot-databattle-board');
    for(var i=0;i<13;i++) {
      var el_row = document.createElement('tr');
      for(var j=0;j<16;j++) {
        var el_cell = document.createElement('spybot-databattle-board-cell');
        el_row.appendChild(el_cells[16*i+j] = el_cell);
      }
      el_board.appendChild(el_row);
    }
    el_root.appendChild(el_board);

    change();

    databattle.onChange(change);

    function change() {
      var newCells = databattle.cells;

      /* remove existing overlays */
      Array.prototype.slice.call(el_board.getElementsByTagName('spybot-databattle-board-cell-overlay')).forEach(function(e) {
        e.parentNode.removeChild(e);
      });

      for(var i=0;i<16*13;i++) {
        var el_cell = el_cells[i];
        var cell = cells[i];
        var newCell = newCells[i];

        // passability has changed
        if(Boolean(cell.passable) !== Boolean(newCell.passable)) {
          if(newCell.passable) {
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

        /* if occupancy has changed */
        if(cell.occupant !== newCell.occupant && (cell.occupant || newCell.occupant)) {

          /* add/remove occupied class */
          if (cell.occupant && !newCell.occupant) {
            el_cell.classList.remove('spybot-databattle-board-cell-occupied');
          }
          else if (!cell.occupant && newCell.occupant) {
            el_cell.classList.add('spybot-databattle-board-cell-occupied');
          }

          /* remove existing sector if necessary */
          if (cell.occupant) {
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

        /* if unit-head status has changed */
        if (Boolean(cell.hasUnitHead) !== Boolean(newCell.hasUnitHead)) {
          if (newCell.occupant) {
            var el_sector = el_cell.getElementsByTagName('spybot-databattle-board-cell-sector')[0];
            if (newCell.hasUnitHead) {
              el_sector.classList.add('spybot-databattle-board-cell-sector-unit-head');
            }
            else {
              el_sector.classList.remove('spybot-databattle-board-cell-sector-unit-head');
            }
          }
        }

        /* add step-extents overlay if square is reachable */
        if (move && Databattle.distance(i, databattle.units[move.uid].sectors[0]) <= move.remaining) {
          var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
          el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-extents');
          el_cell.appendChild(el_overlay);
        }
      }

      function stepPointerOverlay(target, claff) {
        var el_overlay = document.createElement('spybot-databattle-board-cell-overlay');
        el_overlay.setAttribute('spybot-databattle-board-cell-overlay-function', 'step-pointer');
        el_overlay.setAttribute('spybot-databattle-board-cell-overlay-step-pointer-direction', claff);
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

          if(move.remaining === 0) {
            move.uid++;
            if(move.uid<=4) {
              move.remaining = databattle.units[move.uid].moveRate;
            }
            else {
              cb({type: 'turn'});
            }
            change();
          }
        }
      };
    };
  };
};
