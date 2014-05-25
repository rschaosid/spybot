/* Grid:
 *   cells[x][y];
 *   
 * Program:
 *   
 */

var Effects = {"damage" : 0, "heal" : 1}

var sliceAction =
    {effect: Effects.damage, magnitude: 1, range: 1, reqSize: 0, description: "Hacks!"};

var unitHackTemplate =
    {actions: [sliceAction], moveRate: 2, maxSize: 4, name: "Hack",
         description: "Slices you."};
 

var Actions = {"step": 0, "attack": 1, "move": 2, "turn": 3 };

var MAX_GRID_X = 16;
var MAX_GRID_Y = 13;
var PLAYER_1 = 0;
var ENEMY_AI = 1;

function Cell(passable) {
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
}

function PosNode(node, element) {
  if (node == null) {
    this.element = element;
  } else {
    if ((node.element == null) || (node.element == null))
      throw "Cannot copy empty node";
    this.element = [node.element[0], node.element[1]];
  }
  
  this.next = null;
}

function UnitTrail(lst) {
  if (lst == null) {
    this.size = 0;
    this.front = null;
    this.back = null;
  } else {
    this.size = lst.size;
    var current = lst.front;
    var previous = new PosNode(current, null);
    this.front = previous;
    while (current != lst.back) {
      current = current.next;
      previous.next = new PosNode(current, null);
      previous = previous.next;
    }
    this.back = previous;
  }
  
  this.add = function(newElement) {
    var added = new PosNode(null, newElement);
    
    if (this.front == null) {
      this.front = added;
      this.size = 1;
      this.back = this.front;
    } else {
      this.size++;
      added.next = this.front;
      this.front = added;
    }
  }
  
  this.trim = function(toRemove) {
    if (toRemove >= this.size) {
      this.front = null;
      this.back = null;
      this.size = 0;
    }
    
    var current = this.front;
    var i = 0;
    while ((this.size - i) > (toRemove + 1)) {
      current = current.next;
      i++;
    }
    
    current.next = null;
    this.back = current;
    this.size -= toRemove;
  }
  
  this.posEqual = function(p1, p2) {
    return (p1[0] == p2[0]) && (p1[1] == p2[1]);
  }
  
  this.contains = function(target) {
    var current = this.front;
    while (current != null) {
      if (this.posEqual(current.element, target)) return true;
      else current = current.next;
    }
    
    return false;
  }
  
  
  this.remove = function(target) {
    var previous = this.front;
    var current = this.front;
    
    if (posEqual(curent.element, target)) {
      if (this.front == this.back) {
        this.front = null;
        this.back = null;
        return;
      }
      
      this.front = this.front.next;
    }
    
    while (!posEqual(current.element, target)) {
      if (current.next == null)
        throw "Element not found!";
      previous = current;
      current = current.next;
    }
    
    if (current == this.back) {
      this.back = previous;
    }
    previous.next = current.next;
  }
}

function Unit(template, alignment, UID) {
    this.actions = template.actions;
    this.moveRate = template.moveRate;
    this.maxSize = template.maxSize;
    this.name = template.name;
    this.description = template.description;
    this.alignment = alignment;
    this.UID = UID;
    
    this.damage = function(hurt) {
      this.trail.trim(hurt);
    }
    
    this.step = function(target, grid) {
        if (!this.hasOwnProperty('virtualTrail'))
            this.virtualTrail = new UnitTrail(this.trail);
        
        var vrt = this.virtualTrail;
        
        if (vrt.contains(target)) {
          vrt.remove(target);
          vrt.add(target);
        } else {
          if (this.size == this.maxSize) {
            vrt.trim(1);
            vrt.add(target);
          } else {
            vrt.add(target);
            this.size++;
          }
        }
    }
}

function Grid(sizeX, sizeY) {
  this.sizeX = sizeX;
  this.sizeY = sizeY;
  this.cells = new Array(sizeX);
  for (var i = 0; i < sizeX; i++) {
    this.cells[i] = new Array(sizeY);
  }
  
  this.getBoard = function() {
    var result = new Array(this.sizeX);
    
    for (var x = 0; x < this.sizeX; x++) {
      result[x] = new Array(this.sizeY);
      for (var y = 0; y < this.sizeY; y++) {
        result[x][y] = new Cell(this.cells[x][y].copy());
      }
    } 
    
    return result;
  }
  
  for (var x = 0; x < this.sizeX; x++) {
    for (var y = 0; y < this.sizeY; y++) {
      this.cells[x][y] = new Cell(true);
    }
  }
  
  this.addUnit = function(unit, posX, posY) {
    this.cells[posX][posY].occupier = unit.UID;
    unit.pos = [posX, posY];
    unit.size = 1;
    unit.trail = new UnitTrail(null);
    unit.trail.add(unit.pos);
  }
}

function validMovePosition(unit, target, grid) {
  var dist = Math.abs(target[0] - unit[0]) + Math.abs(unit[0] - target[0]);
  if (dist > 1) return false;
  
  var occupier = grid.cells[target[0]][target[1]].occupier;
  if ((occupier != null) && (occupier.UID != unit.UID)) return false;
  
  return grid.cells[target[0]][target[1]].passable;
}

function GameCallBack(grid) {
  function logicCallBack(action) {
    switch (action.type) {
    case Actions.step:
      if (!validMovePosition(action.unit, action.target, grid))
        throw "Invalid step.";
      break;
    case Actions.attack:
      var headPos = action.unit.
      break;
    case Actions.move:
      break;
    case Actions.turn:
      break;
    default: throw "Invalid action ID.";
    } 
  
  }
}

module.exports.Grid = Grid;

var testUID = 128;
var unitHack = new Unit(unitHackTemplate, PLAYER_1, testUID);

var g = new Grid(MAX_GRID_X, MAX_GRID_Y);

g.addUnit(unitHack, 1, 1);

unitHack.step([1,0], g);
unitHack.step([2,0], g);
unitHack.step([2,1], g);

exports.unitHack = unitHack;
exports.g = g;
