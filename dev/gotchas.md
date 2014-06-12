# Gotchas
details that we shouldn't forget about

## Cellular Automata: Sydney Project
There are three quirks in this level related to the upload zone that is
initially filled with a Bit-Man.  No other level exhibits any of these quirks.
* An extra Bit-Man is available to the player for this level.  E.g., if the
  player has only bought 1 Bit-Man, they will be able to place 2 Bit-Mans for
  this level.
* The upload zone on the left is initially occupied by a Bit-Man.
* It is impossible to start the databattle if the upload zone on the left is
  empty.

## Units that have no attacks
Memory Hog has no attacks.  In the original game, Memory Hog's move is finalized
as soon as it has reached its move extents (after taking 5 steps, assuming
moveRate 5), and therefore it is not possible to undo a long move on an
attackless unit in the original game.  This will obviously be possible in our
version, but there is an edge case with credit collection in this case: we
cannot consider a credit collection finalized until the entire move has been
finalized if the credit was collected by a unit with no attacks on the last step
of its move.
