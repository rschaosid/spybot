var testUID = 128;
var unitHack = new Unit(unitHackTemplate, PLAYER_1, testUID);

//var g = new Grid(MAX_GRID_X, MAX_GRID_Y);

g.addUnit(unitHack, 1, 1);

unitHack.step([1,0], g);
unitHack.step([2,0], g);
unitHack.step([2,1], g);

exports.unitHack = unitHack;
exports.g = g;
