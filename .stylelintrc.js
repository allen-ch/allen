module.exports = {
    extends: 'stylelint-config-standard',
    plugins: [
        'stylelint-scss'
    ],
    rules: {
        'indentation': 4|'tab',
        'at-rule-no-unknown': null,
        'color-hex-length': null,
        'color-hex-case': null,
        'scss/at-rule-no-unknown': true,
        'block-no-empty': null,
        'no-descending-specificity': null,
        'font-family-no-missing-generic-family-keyword': null,
        'no-eol-whitespace': null,
        'number-leading-zero': null,
        'color-hex-length': null,
        'color-hex-case': null,
        'selector-list-comma-newline-after': null
    },
    ignoreFiles: 'lib/**/*.scss'
}
