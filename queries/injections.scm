; extends
(attribute
  key: (identifier) @key
  value: (string_lit) @injection.content
  (#eq? @key "regex")
  (#set! injection.language "regex"))

; Inject the 'bash' language into any attribute named "replacement".
; This is used to highlight backreferences like $1, $2, etc. as variables.
(attribute
  key: (identifier) @key
  value: (string_lit) @injection.content
  (#eq? @key "replacement")
  ; ADD THIS LINE: Only inject if the string does NOT contain the characters "${"
  ; otherwise it is throwing an error if river is being injected in yaml
  (#not-match? @injection.content "\\$\\{")
  (#set! injection.language "bash"))

