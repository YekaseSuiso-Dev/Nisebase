"use strict";
const sortIntersectionTypes = require("./rules/sort-intersection-types.js");
const sortSvelteAttributes = require("./rules/sort-svelte-attributes.js");
const sortAstroAttributes = require("./rules/sort-astro-attributes.js");
const sortArrayIncludes = require("./rules/sort-array-includes.js");
const sortVueAttributes = require("./rules/sort-vue-attributes.js");
const sortNamedExports = require("./rules/sort-named-exports.js");
const sortNamedImports = require("./rules/sort-named-imports.js");
const sortObjectTypes = require("./rules/sort-object-types.js");
const sortUnionTypes = require("./rules/sort-union-types.js");
const sortInterfaces = require("./rules/sort-interfaces.js");
const sortJsxProps = require("./rules/sort-jsx-props.js");
const sortExports = require("./rules/sort-exports.js");
const sortImports = require("./rules/sort-imports.js");
const sortObjects = require("./rules/sort-objects.js");
const sortClasses = require("./rules/sort-classes.js");
const sortEnums = require("./rules/sort-enums.js");
const sortMaps = require("./rules/sort-maps.js");
const index = require("./typings/index.js");
const _package = require("./package.json.js");
let createConfigWithOptions = (options) => {
  let recommendedRules = {
    [sortImports.RULE_NAME]: [
      "error",
      {
        groups: [
          "type",
          ["builtin", "external"],
          "internal-type",
          "internal",
          ["parent-type", "sibling-type", "index-type"],
          ["parent", "sibling", "index"],
          "object",
          "unknown"
        ],
        "custom-groups": {
          value: {},
          type: {}
        },
        "newlines-between": "always",
        "internal-pattern": ["~/**"]
      }
    ],
    [sortClasses.RULE_NAME]: [
      "error",
      {
        groups: [
          "index-signature",
          "static-property",
          "private-property",
          "property",
          "constructor",
          "static-method",
          "private-method",
          "method",
          ["get-method", "set-method"],
          "unknown"
        ]
      }
    ],
    [sortObjects.RULE_NAME]: [
      "error",
      {
        "partition-by-comment": false
      }
    ],
    [sortArrayIncludes.RULE_NAME]: [
      "error",
      {
        "spread-last": true
      }
    ],
    [sortIntersectionTypes.RULE_NAME]: ["error"],
    [sortSvelteAttributes.RULE_NAME]: ["error"],
    [sortAstroAttributes.RULE_NAME]: ["error"],
    [sortVueAttributes.RULE_NAME]: ["error"],
    [sortNamedExports.RULE_NAME]: ["error"],
    [sortNamedImports.RULE_NAME]: ["error"],
    [sortObjectTypes.RULE_NAME]: ["error"],
    [sortUnionTypes.RULE_NAME]: ["error"],
    [sortInterfaces.RULE_NAME]: ["error"],
    [sortJsxProps.RULE_NAME]: ["error"],
    [sortExports.RULE_NAME]: ["error"],
    [sortEnums.RULE_NAME]: ["error"],
    [sortMaps.RULE_NAME]: ["error"]
  };
  return {
    rules: Object.fromEntries(
      Object.entries(recommendedRules).map(([key, [message, baseOptions = {}]]) => [
        `perfectionist/${key}`,
        [message, Object.assign(baseOptions, options)]
      ])
    ),
    plugins: ["perfectionist"]
  };
};
const mod = {
  rules: {
    [sortArrayIncludes.RULE_NAME]: sortArrayIncludes.default,
    [sortAstroAttributes.RULE_NAME]: sortAstroAttributes.default,
    [sortClasses.RULE_NAME]: sortClasses.default,
    [sortEnums.RULE_NAME]: sortEnums.default,
    [sortExports.RULE_NAME]: sortExports.default,
    [sortImports.RULE_NAME]: sortImports.default,
    [sortInterfaces.RULE_NAME]: sortInterfaces.default,
    [sortJsxProps.RULE_NAME]: sortJsxProps.default,
    [sortMaps.RULE_NAME]: sortMaps.default,
    [sortNamedExports.RULE_NAME]: sortNamedExports.default,
    [sortNamedImports.RULE_NAME]: sortNamedImports.default,
    [sortObjectTypes.RULE_NAME]: sortObjectTypes.default,
    [sortObjects.RULE_NAME]: sortObjects.default,
    [sortSvelteAttributes.RULE_NAME]: sortSvelteAttributes.default,
    [sortIntersectionTypes.RULE_NAME]: sortIntersectionTypes.default,
    [sortUnionTypes.RULE_NAME]: sortUnionTypes.default,
    [sortVueAttributes.RULE_NAME]: sortVueAttributes.default
  },
  configs: {
    "recommended-alphabetical": createConfigWithOptions({
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc,
      "ignore-case": false
    }),
    "recommended-natural": createConfigWithOptions({
      type: index.SortType.natural,
      order: index.SortOrder.asc,
      "ignore-case": false
    }),
    "recommended-line-length": createConfigWithOptions({
      type: index.SortType["line-length"],
      order: index.SortOrder.desc
    })
  },
  name: _package.name
};
module.exports = mod;
