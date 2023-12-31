module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "jest": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 7,
        "sourceType": "module",
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        }
    },
    "plugins": [
        "standard",
    ],
    "globals": {
        "_": true,
        "$": true,
        "messages": true,
        "module": true,
        "require": true,
        "loadFixtures": true,
        "global": true,
        "jest": true,
        "it": true,
        "expect": true,
        "afterAll": true,
        "afterEach": true,
        "beforeAll": true,
        "beforeEach": true,
        "describe": true,
        "inject": true,
        "angular": true,
        "require": true,
        "test": true,
        "xdescribe": true,
        "process": true,
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-len": [
            "warn",
            140
        ],
        "no-console": [
            "off"
        ],
        "no-unused-vars": [
            "warn",
            { "args": "none" }
        ],
        "no-undef": [
            "error"
        ],
        "semi": [
            "warn",
            "never"
        ],
        "accessor-pairs": 2,
        "arrow-spacing": [
            2,
            {
                "before": true,
                "after": true
            }
        ],
        "block-spacing": [
            2,
            "always"
        ],
        "brace-style": [
            2,
            "1tbs",
            {
                "allowSingleLine": true
            }
        ],
        "comma-spacing": [
            2,
            {
                "before": false,
                "after": true
            }
        ],
        "comma-style": [
            2,
            "last"
        ],
        "constructor-super": 2,
        "curly": [
            2,
            "multi-line"
        ],
        "dot-location": [
            2,
            "property"
        ],
        "eol-last": 2,
        "eqeqeq": [
            2,
            "allow-null"
        ],
        "generator-star-spacing": [
            2,
            {
                "before": true,
                "after": true
            }
        ],
        "handle-callback-err": [
            2,
            "^(err|error)$"
        ],
        "keyword-spacing": 2,
        "key-spacing": [
            2,
            {
                "beforeColon": false,
                "afterColon": true
            }
        ],
        "new-cap": [
            2,
            {
                "newIsCap": true,
                "capIsNew": false
            }
        ],
        "new-parens": 2,
        "no-array-constructor": 2,
        "no-caller": 2,
        "no-class-assign": 2,
        "no-cond-assign": 2,
        "no-const-assign": 2,
        "no-control-regex": 2,
        "no-debugger": 2,
        "no-delete-var": 2,
        "no-dupe-args": 2,
        "no-dupe-class-members": 2,
        "no-dupe-keys": 2,
        "no-duplicate-case": 2,
        "no-empty-character-class": 2,
        "no-eval": 2,
        "no-ex-assign": 2,
        "no-extend-native": 2,
        "no-extra-bind": 2,
        "no-extra-boolean-cast": 2,
        "no-extra-parens": [
            2,
            "functions"
        ],
        "no-fallthrough": 2,
        "no-floating-decimal": 2,
        "no-func-assign": 2,
        "no-implied-eval": 2,
        "no-inner-declarations": [
            2,
            "functions"
        ],
        "no-invalid-regexp": 2,
        "no-irregular-whitespace": 2,
        "no-iterator": 2,
        "no-label-var": 2,
        "no-labels": 2,
        "no-lone-blocks": 2,
        "no-mixed-spaces-and-tabs": 2,
        "no-multi-spaces": 2,
        "no-multi-str": 2,
        "no-multiple-empty-lines": [
            2,
            {
                "max": 2
            }
        ],
        "no-native-reassign": 2,
        "no-negated-in-lhs": 2,
        "no-new": 0,
        "no-new-func": 2,
        "no-new-object": 2,
        "no-new-require": 2,
        "no-new-wrappers": 2,
        "no-obj-calls": 2,
        "no-octal": 2,
        "no-octal-escape": 2,
        "no-proto": 2,
        "no-redeclare": 2,
        "no-regex-spaces": 2,
        "no-return-assign": 2,
        "no-self-compare": 2,
        "no-sequences": 2,
        "no-shadow-restricted-names": 2,
        "no-spaced-func": 2,
        "no-sparse-arrays": 2,
        "no-this-before-super": 2,
        "no-throw-literal": 2,
        "no-trailing-spaces": 2,
        "no-undef-init": 2,
        "no-unexpected-multiline": 2,
        "no-unneeded-ternary": [
            2,
            {
                "defaultAssignment": false
            }
        ],
        "no-unreachable": 2,
        "no-useless-call": 2,
        "no-with": 2,
        "one-var": [
            2,
            {
                "initialized": "never"
            }
        ],
        "operator-linebreak": [
            2,
            "after",
            {
                "overrides": {
                    "?": "before",
                    ":": "before"
                }
            }
        ],
        "padded-blocks": [
            2,
            "never"
        ],
        "quotes": [
            "warn",
            "single",
            "avoid-escape"
        ],
        "radix": [
            2,
            "as-needed"
        ],
        "semi-spacing": [
            2,
            {
                "before": false,
                "after": true
            }
        ],
        "space-before-blocks": [
            2,
            "always"
        ],
        "space-in-parens": [
            2,
            "never"
        ],
        "space-infix-ops": 2,
        "space-unary-ops": [
            2,
            {
                "words": true,
                "nonwords": false
            }
        ],
        "spaced-comment": [
            2,
            "always",
            {
                "markers": [
                    "global",
                    "globals",
                    "eslint",
                    "eslint-disable",
                    "*package",
                    "!",
                    ","
                ]
            }
        ],
        "use-isnan": 2,
        "valid-typeof": 2,
        "wrap-iife": [
            2,
            "any"
        ],
        "yoda": [
            2,
            "never"
        ],
        "standard/object-curly-even-spacing": [
            2,
            "either"
        ],
        "standard/array-bracket-even-spacing": [
            2,
            "either"
        ],
        "standard/computed-property-even-spacing": [
            2,
            "even"
        ],
    }
}
