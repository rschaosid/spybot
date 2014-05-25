var HumanInterface = require('./human-interface.js');
var Databattle = require('./databattle.js');

document.addEventListener('DOMContentLoaded', function() {
  var databattle = new Databattle();

  var els = document.getElementsByTagName('spybot');
  var interfaces = Array.prototype.slice.call(els).map(function(el) {
    return new HumanInterface(el);
  });

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/assets/levels/demo-level.json', true);
  xhr.onload = function() {
    var level = JSON.parse(xhr.responseText);
    databattle.initialize(level);
    interfaces.forEach(function(i) {
      i.initialize(databattle);
    });
  };
  xhr.send(null);
});
