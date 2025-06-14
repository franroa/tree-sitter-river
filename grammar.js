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
    
    // --- CAMBIOS REALIZADOS ---

    // 1. `string_lit` ahora elige entre los dos tipos de comillas.
    string_lit: $ => choice(
      $.double_quoted_string,
      $.single_quoted_string
    ),

    // 2. La lógica de comillas dobles es una COPIA EXACTA de tu implementación original.
    //    He creado una nueva regla para ella sin tocar su contenido.
    double_quoted_string: $ => seq(
      '"',
      repeat(choice(
        $.interpolation,
        $.escape_sequence,
        $._string_content // Se reutiliza tu regla original _string_content
      )),
      '"'
    ),

    // 3. Tu lógica original para el contenido y escapes de comillas dobles, SIN CAMBIOS.
    interpolation: $ => prec(1, seq(
      '${',
      $._expression,
      '}'
    )),
    escape_sequence: $ => token.immediate(/\\./),
    _string_content: $ => token.immediate(
      /[^"\\$]+|\\\$|\$|./
    ),

    // 4. Se añade el soporte para comillas simples de forma completamente nueva y separada.
    single_quoted_string: $ => seq(
      "'",
      repeat(choice(
        $._single_quote_escape_sequence,
        $._single_quote_string_content
      )),
      "'"
    ),
    _single_quote_escape_sequence: $ => token.immediate(/\\['\\]/),
    _single_quote_string_content: $ => token.immediate(/[^'\\]+/),

    // --- FIN DE LOS CAMBIOS ---

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

function sepBy1(separator, rule) {
  return seq(rule, repeat(seq(separator, rule)));
}

function sepBy(separator, rule) {
  return optional(sepBy1(separator, rule));
}
