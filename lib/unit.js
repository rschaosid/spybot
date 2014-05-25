module.exports = function Unit(template, alignment, UID) {
  function PosNode(node, element) {
    if (node == null) {
      this.element = element;
    } else {
      if ((node.element == null) || (node.element == null))
        throw "Cannot copy empty node";
      this.element = [node.element.x, node.element.y];
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
      var res;
      if (toRemove >= this.size) {
        res.dead = true;
        res.removed = this.front;
        this.front = null;
        this.back = null;
        this.size = 0;
      }
      
      res.dead = false;
      var current = this.front;
      var i = 0;
      while ((this.size - i) > (toRemove + 1)) {
        current = current.next;
        i++;
      }

      res.removed = current.next;
      current.next = null;
      this.back = current;
      this.size -= toRemove;
      return res;
    }

    this.posEqual = function(p1, p2) {
      return (p1.x == p2.x) && (p1.y == p2.y);
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

  this.actions = template.actions;
  this.moveRate = template.moveRate;
  this.maxSize = template.maxSize;
  this.name = template.name;
  this.description = template.description;
  this.alignment = alignment;
  this.UID = UID;

  this.damage = function(hurt) {
    var res = this.trail.trim(hurt);
    var res.positions = new Array();
    var i = 0;
    while (res.removed != null) {
      res.positions[i] = res.removed.element;
      i++;
      res.removed = res.removed.next;
    }
    
    return res;
  }

  this.step = function(target, grid) {
    if (!this.virtualTrail)
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
};
