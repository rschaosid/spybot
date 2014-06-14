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
    level.units.forEach(function(unit) {
      unit.sectors = unit.sectors.map(function(o) {
        return o.y*16+o.x;
      });
    });
    var databattle = new Databattle(level, [new HumanPlayer(interfaces[0]), new HumanPlayer(interfaces[0])]);
    interfaces.forEach(function(i) {
      i.initialize(databattle);
    });
    databattle.startGame();
  };
  xhr.send(null);
});
