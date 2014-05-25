module.exports = function Cell(passable) {
  this.passable = passable;
  this.occupier = null;

  this.copy = function() {
    var result = new Cell(this.passable);
    result.credit = this.credit;
    result.hasDatacard = this.hasDatacard;
    result.occupier = this.occupier;
    result.hasUnitHead = this.hasUnitHead;
    return result;
  }
};
