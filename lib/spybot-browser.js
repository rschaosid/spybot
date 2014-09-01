var HumanInterface = require('./human-interface.js');
var HumanPlayer = require('./human-player.js');
var Databattle = require('./databattle.js');

document.addEventListener('DOMContentLoaded', function() {
  var els = document.getElementsByTagName('spybot');
  var interfaces = Array.prototype.slice.call(els).map(function(el) {
    return new HumanInterface(el);
  });

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/assets/levels/demo-level.json', true);
  xhr.onload = function() {
    var level = JSON.parse(xhr.responseText);
    
    var players = [];
    players[0] = new HumanPlayer(interfaces[0]);
    players[1] = new HumanPlayer(interfaces[0]);

    level.units.forEach(function(unit) {
      unit.sectors = unit.sectors.map(function(o) {
        return o.y*16+o.x;
      });

      if (unit.alignment === 0) {
        players[0].addUnit(unit);
      } else {
        players[1].addUnit(unit);
      }
    });


    var databattle = new Databattle(level, [players[0], players[1]]);

    for (var i = 0; i < interfaces.length; i++) {
      interfaces[i].initialize(databattle, players[i]);
    }

    databattle.startGame();
  };
  xhr.send(null);
});
