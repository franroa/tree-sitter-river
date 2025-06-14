(block
  name: (qualified_identifier (identifier) @rule_block_id)
  (#eq? @rule_block_id "rule") ; Tree-sitter predicate: ensures the identifier text is "rule"

  body: (block_body
    (attribute
      key: (identifier) @name ; Capture the attribute's key identifier (e.g., "action", "target_label").
      (#set! "kind" "Property")
    ) @symbol ;; The attribute itself becomes the symbol.
  )
)
(attribute
  key: (identifier) @name ; Capture the attribute's key identifier (e.g., "targets", "action", "address").
  (#set! "kind" "Property")
) @symbol
;; ;; --- Query 2: Handling for other nested 'block' types ---
;; ;; This query matches 'block' nodes that are direct children of a 'block_body'.
;; ;; This specifically targets blocks nested within other blocks (e.g., 'rule_namespace_selector').
;; ;; It will *not* match 'rule' blocks (whose attributes are handled by Query 1) due to query order.
;; (block_body
;;   (block
;;     name: (qualified_identifier) @name ; Capture the block's qualified identifier.
;;
;;     ;; Set the 'kind' of the symbol to "Method" for nested blocks.
;;     (#set! "kind" "Method")
;;   ) @symbol
;; )

;; --- Query 3: General handling for top-level 'block' types ---
;; This query acts as a fallback for any 'block' nodes that were not matched
;; by the more specific queries above. These are typically the top-level blocks
;; (e.g., 'discovery.relabel', 'loki.source.kubernetes', 'mimir.rules.kubernetes').
(block
  ;; Capture the 'qualified_identifier' as the primary name for the symbol.
  name: (qualified_identifier) @name

  ;; Set the 'kind' of the symbol to "Class" for top-level blocks.
  (#set! "kind" "Class")
) @symbol

