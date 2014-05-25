var HumanInterface = require('./human-interface.js');
var Databattle = require('./databattle.js');

document.addEventListener('DOMContentLoaded', function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/assets/levels/demo-level.json', true);
  xhr.onload = function() {
    var level = JSON.parse(xhr.responseText);
    var els = document.getElementsByTagName('spybot');
    Array.prototype.slice.call(els).forEach(function(el) {
      var databattle = new Databattle();
      databattle.initialize(level);
      el.spybot = new HumanInterface(databattle, el);
    });
  };
  xhr.send(null);
});
