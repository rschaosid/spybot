var HumanInterface = require('./human-interface.js');
var Databattle = require('./databattle.js');

document.addEventListener('DOMContentLoaded', function() {
  var els = document.getElementsByTagName('spybot');
  Array.prototype.slice.call(els).forEach(function(el) {
    el.spybot = new HumanInterface(new Databattle(), el);
  });
});
