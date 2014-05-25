module.exports = function Unit(template, alignment, UID) {
  function moveHead(list, newElement) {
    list.unshift(newElement);
  }

  function trim (list, toRemove) {
    if (toRemove >= list.length) {
      var res = list;
      list = [];
      return res;
    }
    
    var res = list.slice(-toRemove);
    list = list.slice(0, this.length - toRemove - 1);
    return res;
  }

  function posEqual = function(p1, p2) {
    return (p1.x == p2.x) && (p1.y == p2.y);
  };

  function getIndex(target, list) {
    var i = 0;
    while (i < this.spaces.length) {
      if (posEqual(this.spaces[i], target)) return i;
      else i++;
    }
    
    return -1;
  }

  function remove(list, target) {
    var index = getIndex(target, list);
    if (index < 0) throw new Error("No such element in the array.");
    list.splice(index, 1);
  }
  
  this.spaceCopy = function() {
    var i = 0;
    var res = [];
    while (i < this.spaces.length) {
      res[i].x = this.spaces[i].x;
      res[i].y = this.spaces[i].y;
      i = i + 1;
    }
    
    return res;
  }
  
  this.actions = template.actions;
  this.moveRate = template.moveRate;
  this.maxSize = template.maxSize;
  this.name = template.name;
  this.description = template.description;
  this.alignment = alignment;
  this.UID = UID;

  this.trail = [];

  this.damage = function(hurt) {
    return trim(this.trail, hurt);
  };

  this.step = function(target, grid) {
    if (!this.virtualTrail) {
      this.virtualTrail = this.spaceCopy();
    }

    var vrt = this.virtualTrail;
    var res;
    
    if (getIndex(target, vrt) >= 0) {
      remove(vrt, target);
      moveHead(vrt, target);
      res = null;
    } else {
      var res;
      if (this.size == this.maxSize) {
        res.removed = trim(1);
        moveHead(vrt, target);
      } else {
        moveHead(vrt, target);
        this.size++;
      }
      res.added = target;
      return res;
    }
  };
};
