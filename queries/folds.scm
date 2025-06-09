; Fold the body of any block (the content inside the braces).
; This provides a great user experience as the block's name remains visible.
(block
  body: (block_body) @fold)

; Fold entire multi-line arrays and objects.
(array) @fold
(object) @fold

; Fold multi-line comments.
(comment) @fold
