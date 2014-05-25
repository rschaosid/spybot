module.exports = function Cell(passable) {
  this.passable = passable;
  this.occupier = null;

  this.copy = function() {
    var result = new Cell(this.passable);
    result.credit = this.credit;
    result.hasDataCard = this.hasDataCard;
    result.occupier = this.occupier;
    result.hasHead = this.hasHead;
    return result;
  }
};
