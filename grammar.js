module.exports = grammar({
  name: "river",

  extras: ($) => [$.comment, /\s/],

  supertypes: $ => [
    $._expression,
    $.literal_value,
  ],

  rules: {
    // Top-level file rule (normal files)
    config_file: ($) => repeat($.block),

    // Injection entrypoint (parsing raw code inside YAML string scalars)
    injected_content: ($) => repeat(choice($.block, $.attribute)),

    block: ($) =>
      seq(
        field("name", $.qualified_identifier),
        field("label", optional(alias($.string_lit, $.label))),
        field("body", $.block_body)
      ),

    block_body: ($) => seq("{", repeat(choice($.attribute, $.block)), "}"),

    attribute: ($) =>
      seq(
        field("key", $.identifier),
        "=",
        field("value", $._expression)
      ),

    _expression: ($) =>
      choice(
        $.literal_value,
        $.array,
        $.object,
        $.qualified_identifier,
        $.function_call,
        $.operation,
        $.access,
        $.parenthesized_expression
      ),

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    literal_value: ($) =>
      choice($.numeric_lit, $.bool_lit, $.null_lit, $.string_lit),

    operation: ($) => choice($.unary_operation, $.binary_operation),

    unary_operation: ($) => prec(7, seq(choice("-", "!"), $._expression)),

    binary_operation: ($) => {
      const table = [
        [6, choice("*", "/", "%")],
        [5, choice("+", "-")],
        [4, choice("==", "!=", "<", "<=", ">", ">=")],
        [3, "&&"],
        [2, "||"],
        [1, "^"],
      ];
      return choice(
        ...table.map(([precedence, operator]) =>
          prec.left(precedence, seq(
            field('left', $._expression),
            operator,
            field('right', $._expression)
          ))
        )
      );
    },

    array: ($) => seq("[", optional(sepBy(",", $._expression)), optional(","), "]"),

    object: ($) => seq("{", optional(sepBy(",", $.object_assignment)), optional(","), "}"),

    object_assignment: ($) =>
      seq(
        field('key', choice($.identifier, $.string_lit)),
        "=",
        field('value', $._expression)
      ),

    access: ($) => seq($._expression, "[", $._expression, "]"),

    function_call: ($) =>
      seq(
        field("function", $.qualified_identifier),
        "(",
        field("arguments", optional(sepBy(",", $._expression))),
        ")"
      ),

    string_lit: $ => seq(
      '"',
      repeat(choice(
        $.interpolation,
        $.escape_sequence,
        $._string_content
      )),
      '"'
    ),

    interpolation: $ => prec(1, seq(
      '${',
      $._expression,
      '}'
    )),

    escape_sequence: $ => token.immediate(/\\./),

    _string_content: $ => token.immediate(
      /[^"\\$]+|\\\$|\$|./
    ),

    identifier: ($) => /[\p{ID_Start}_][\p{ID_Continue}_]*/,

    qualified_identifier: ($) => sepBy1('.', $.identifier),

    numeric_lit: $ => token(choice(
      /0x[0-9a-fA-F]+/,
      /[0-9]+(\.[0-9]*)?([eE][+-]?[0-9]+)?/
    )),

    bool_lit: ($) => choice("true", "false"),
    null_lit: ($) => "null",

    comment: ($) =>
      token(
        choice(
          seq("#", /.*/),
          seq("//", /.*/),
          seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")
        )
      ),

    _whitespace: ($) => token(/\s/),
  },
});

/**
 * Creates a rule to match one or more occurrences of a rule separated by a separator.
 * @param {RuleOrLiteral} separator 
 * @param {RuleOrLiteral} rule 
 * @returns {SeqRule}
 */
function sepBy1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}

/**
 * Creates a rule to match zero or more occurrences of a rule separated by a separator.
 * @param {RuleOrLiteral} separator 
 * @param {RuleOrLiteral} rule 
 * @returns {Rule}
 */
function sepBy(separator, rule) {
  return optional(sepBy1(separator, rule));
}

