export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'color-no-hex': true,
    'declaration-property-value-disallowed-list': [
      {
        '/^(?:color|background|background-color|border-color|outline-color)$/':
          ['/(?:rgb|hsl)a?\\(/', '/#[0-9a-fA-F]{3,8}/'],
        '/^(?:margin|padding|gap|row-gap|column-gap)$/': [
          '/^-?\\d+(?:\\.\\d+)?(?:px|rem|em)$/',
        ],
        'writing-mode': ['/^(?:vertical|sideways)-/'],
      },
      {
        message: (property) =>
          property === 'writing-mode'
            ? '字型子集只保留水平排版 feature（ADR-0012）。'
            : '此值違反既有 tokens。',
      },
    ],
    'property-disallowed-list': [
      ['/^font-(?:feature-settings|variant(?:-.+)?)$/'],
      {
        message: '字型子集只保留水平排版 feature（ADR-0012）。',
      },
    ],
    'selector-class-pattern': null,
  },
  overrides: [
    {
      files: ['**/*.astro'],
      customSyntax: 'postcss-html',
    },
    {
      files: ['src/styles/tokens.css'],
      rules: {
        'color-no-hex': null,
        'custom-property-empty-line-before': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
