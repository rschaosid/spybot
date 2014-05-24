function Databattle(players) {
  var state = {
    apply: function(move) {
      alert('applying move '+move);
    }
  };
  function turn(i) {
    players[i].getMove().then(function(move) {
      state.apply(move);
      turn(1-i);
    });
  }
}
