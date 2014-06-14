module.exports = function HumanPlayer(interface) {
  this.getMove = function(cb) {
    interface.getMove(cb);
  };
};
