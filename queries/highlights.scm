
; https://git.mzte.de/nvim-plugins/nvim-treesitter/src/branch/master/queries/hcl/highlights.scm
; https://git.mzte.de/nvim-plugins/nvim-treesitter/src/branch/master/queries/hcl/highlights.scm
(comment) @comment
[
  "-"
  "!"
  "!="
  "*"
  "/"
  "&&"
  "%"
  "^"
  "+"
  "<"
  "<="
  "="
  "=="
  ">"
  ">="
  "||"
] @operator

; (attribute_key) @variable.attribute
; (block
;  name: (identifier) @type)
; (string_lit) @string
; (label) @string
; (function_call
;  function: (identifier) @function.builtin)
; queries/highlights.scm

; WORKAROUND for older Tree-sitter versions that don't support '>'
; Rule for the name of the FIRST TOP-LEVEL block (appearing after any initial comments).
; This identifier will be captured as @type.first.
; It will also match the general @type rule below.
; Themes can then prioritize @type.first if a specific style is defined for it.
(config_file
  (comment)* ; Matches zero or more comment nodes that might appear first
  (block      ; Then matches the block node immediately following those comments
    name: (qualified_identifier) @keyword)) ; @first_block_context is optional for query debugging

; General rule for all block names (including the first one).
; If a theme doesn't have a specific style for @type.first,
; the style for @type would typically apply.
; (block
;   name: (identifier) @type)
;

(block 
  body: (block_body
    (block name: (qualified_identifier)) @type))

; (block
;   body: (block_body
;     (attribute
;       value: (identifier) @keyword)))

; Comments
(comment) @comment

; Literals
(string_lit) @string
(escape_sequence) @string.escape ; For escape sequences within strings
(bool_lit) @boolean
; (number_lit) @number ; Uncomment and adapt if your grammar has number literals

; Block labels
(block
  label: (label (qualified_identifier) @label))
; (qualified_identifier
;   head: (identifier_part) @variable.builtin; discovery
; )

(block 
  name: (qualified_identifier
    head: (identifier_part) 
    tail: (identifier_part)) 
  label: (label 
    (qualified_identifier 
      head: (identifier_part) @string)))
; Attribute Definitions
; Captures the key of an attribute
(attribute
  key: (attribute_key) @property)

; Values that are identifiers (e.g., references to other resources, variables, enums)
; (attribute
;   value: (qualified_identifier) @variable.builtin)
;
; ; Identifiers used as elements within an array
; (array
;   (qualified_identifier) @variable.builtin) ; Or @constant if they are immutable references


; Values that are identifiers (e.g., references to other resources, variables, enums)
(attribute
  value: (qualified_identifier
    head: (identifier_part) @variable.builtin.special
    tail: (identifier_part) @property)) ; e.g., discovery vs the rest

; Identifiers used as elements within an array
(array
  (qualified_identifier
    head: (identifier_part) @variable.builtin.special
    tail: (identifier_part) @property)) ; optional: @constant if they are immutable


(interpolation "${" @punctuation.special
               "}" @punctuation.special)

(interpolation 
  expression: (interpolated_expression 
    (qualified_identifier 
      head: (identifier_part) @punctuation.special )))


(string_text) @string



; --- Optional: Highlighting Punctuation and Operators ---
(attribute "=" @operator)
(object_assignment "=" @operator)
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket
"," @punctuation.delimiter


; --- Developer Notes ---
; 1.  Workaround for 'First Block': The query targeting `@type.first` has been modified
;     to avoid the '>' direct child combinator. It now looks for the first `block`
;     child of `config_file`, potentially after any `comment` nodes.
; 2.  Theme Dependency: Your editor's theme needs to define a style for `@type.first`
;     for it to appear differently.
; 3.  Update Tree-sitter: It's still recommended to update your Tree-sitter environmentçç
;
;
;
; Interpolations like ${foo}
(interpolation) @macro

; Named variables like $metric
(variable_reference) @variable.builtin

; Numeric variables like $1, $2
(numeric_variable_reference) @constant.builtin

; Text inside strings
(string_text) @string

; Escape sequences in strings
(escape_sequence) @escape

; (regex_lit) @string
