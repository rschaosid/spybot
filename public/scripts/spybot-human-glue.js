document.addEventListener('DOMContentLoaded', function() {
  var els = document.getElementsByTagName('spybot-human');
  Array.prototype.slice.call(els).forEach(function(el) {
    el.spybot = SpybotHumanInterface(el);
  });
});
