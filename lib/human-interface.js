module.exports = function HumanInterface(el_root) {
  var that = this;
  this.initialize = function(databattle) {
    var el_backdrop = document.createElement('spybot-databattle-backdrop');
    el_backdrop.setAttribute('spybot-databattle-backdrop-kind', databattle.backdrop || 3);
    el_root.appendChild(el_backdrop);
    var cells = databattle.cells;

    var el_cells = [];
    var el_board=document.createElement('spybot-databattle-board');
    for(var i=0;i<13;i++) {
      var el_row = document.createElement('tr');
      for(var j=0;j<16;j++) {
        var el_cell = document.createElement('spybot-databattle-board-cell');
        var cell = cells[16*i+j];
        if(cell.datacard) {
          el_cell.appendChild(document.createElement('spybot-databattle-board-cell-datacard'));
        }
        if('number' === typeof cell.tileType) {
          var el_floor = document.createElement('spybot-databattle-board-cell-floor');
          el_floor.setAttribute('spybot-databattle-board-cell-floor-tiletype', cell.tileType);
          el_cell.appendChild(el_floor);
        }
        if('number' === typeof cell.occupier) {
          el_cell.classList.add('spybot-databattle-board-cell-occupied');
          var el_sector = document.createElement('spybot-databattle-board-cell-sector');
          el_cell.appendChild(el_sector);
        }
        el_row.appendChild(el_cells[16*i+j] = el_cell);
      }
      el_board.appendChild(el_row);
    }
    el_root.appendChild(el_board);

    databattle.onChange(change);

    function change() {
      var newCells = databattle.cells;
      for(var i=0;i<16*13;i++) {
        var el_cell = el_cells[i];
        var cell = board.cells[i];
        var newCell = newCells[i];

        if(cell.occupant !== newCell.occupant) {
          Array.prototype.slice.call(el_cell.getElementsByTagName('spybot-databattle-board-cell-sector')).forEach(function(e) {
            e.parentNode.removeChild(e);
          });
          if(newCell.occupier) {
            classList.add('spybot-databattle-board-cell-occupied');
            var el_sector = document.createElement('spybot-databattle-board-cell-sector');
            el_cell.appendChild(el_sector);
          }
          else {
            classList.remove('spybot-databattle-board-cell-occupied');
          }
        }
      }
    }

    var move = null;
    that.getMove = function(cb) {
      move = {
        uid: 1,
        left: databattle.units[uid].moveRate
      };
      change();
    };
  };
}
