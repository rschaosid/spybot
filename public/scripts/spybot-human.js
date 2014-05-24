function SpybotHumanInterface(domElement) {
  //var canvas = document.createElement('canvas');
  //canvas.setAttribute('width', 650);
  //canvas.setAttribute('height', 420);
  //el.appendChild(canvas);


  var bkg = document.createElement('div');
  bkg.classList.add('spybot-databattle-backdrop');
  bkg.classList.add('spybot-databattle-backdrop-3');
  domElement.appendChild(bkg);

  var board=document.createElement('table');
  board.classList.add('spybot-databattle-board');
  for(var i=0;i<13;i++) {
    var row = document.createElement('tr');
    for(var j=0;j<16;j++) {
      var cell = document.createElement('td');
      cell.classList.add('spybot-databattle-board-cell-passable');
      cell.classList.add('spybot-databattle-board-cell-type-'+(1+Math.floor(Math.random()*9)));
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
  domElement.appendChild(board)
}
