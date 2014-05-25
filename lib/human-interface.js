module.exports = function HumanInterface(databattle, el_root) {
  var el_backdrop = document.createElement('spybot-databattle-backdrop');
  el_backdrop.setAttribute('spybot-databattle-backdrop-kind', databattle.backdrop || 3);
  el_root.appendChild(el_backdrop);

  var board = databattle.getBoard();

  var el_cells = [];
  var el_board=document.createElement('spybot-databattle-board');
  for(var i=0;i<13;i++) {
    el_cells[i] = new Array(16);
    var el_row = document.createElement('tr');
    for(var j=0;j<16;j++) {
      var el_cell = document.createElement('spybot-databattle-board-cell');
      var cell = board.cells[i][j];
      if(cell.datacard) {
        el_cell.appendChild(document.createElement('spybot-databattle-board-cell-datacard'));
      }
      if('number' === typeof cell.occupier) {
        el_cell.classList.add('spybot-databattle-board-cell-occupied');
        var el_sector = document.createElement('spybot-databattle-board-cell-sector');
      }
      el_row.appendChild(el_cells[i][j] = el_cell);
    }
    el_board.appendChild(el_row);
  }
  el_root.appendChild(el_board);

  databattle.onChange(function() {
    var newBoard = databattle.getBoard();
    for(var i=0;i<13;i++) {
      for(var j=0;j<16;j++) {

      }
    }
  });
};
