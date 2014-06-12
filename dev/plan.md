# Plan
## Things that should be the same
* Titlescreen
* Spybot select (?)
* Possible turns
* Credit-undo bug


## Things that should be different
* Savestate selection replaced with login
* No erratic scrolling on the worldmap (worldmap is only scrolled by arrows,
  dragging, clicking on a node, or following a tower's appearance) and the
  worldmap scrolls to a position that is consistent relative to the selected
  tower
* Player can input steps and attacks in any order as long as the resulting turn
  is legal (i.e. no unit's move depends on an intermediate state of another
  unit's move)
* Selecting another unit never ends the current unit's move
* Undo button undoes steps and attacks (not entire moves) and can be used after
  something is done moving
* rollover/activate oddities of buttons everywhere
* make buttons look disabled when they wouldn't do anything\
