import sortIntersectionTypes, { RULE_NAME as RULE_NAME$e } from "./rules/sort-intersection-types.mjs";
import sortSvelteAttributes, { RULE_NAME as RULE_NAME$d } from "./rules/sort-svelte-attributes.mjs";
import sortAstroAttributes, { RULE_NAME as RULE_NAME$1 } from "./rules/sort-astro-attributes.mjs";
import sortArrayIncludes, { RULE_NAME } from "./rules/sort-array-includes.mjs";
import sortVueAttributes, { RULE_NAME as RULE_NAME$g } from "./rules/sort-vue-attributes.mjs";
import sortNamedExports, { RULE_NAME as RULE_NAME$9 } from "./rules/sort-named-exports.mjs";
import sortNamedImports, { RULE_NAME as RULE_NAME$a } from "./rules/sort-named-imports.mjs";
import sortObjectTypes, { RULE_NAME as RULE_NAME$b } from "./rules/sort-object-types.mjs";
import sortUnionTypes, { RULE_NAME as RULE_NAME$f } from "./rules/sort-union-types.mjs";
import sortInterfaces, { RULE_NAME as RULE_NAME$6 } from "./rules/sort-interfaces.mjs";
import sortJsxProps, { RULE_NAME as RULE_NAME$7 } from "./rules/sort-jsx-props.mjs";
import sortExports, { RULE_NAME as RULE_NAME$4 } from "./rules/sort-exports.mjs";
import sortImports, { RULE_NAME as RULE_NAME$5 } from "./rules/sort-imports.mjs";
import sortObjects, { RULE_NAME as RULE_NAME$c } from "./rules/sort-objects.mjs";
import sortClasses, { RULE_NAME as RULE_NAME$2 } from "./rules/sort-classes.mjs";
import sortEnums, { RULE_NAME as RULE_NAME$3 } from "./rules/sort-enums.mjs";
import sortMaps, { RULE_NAME as RULE_NAME$8 } from "./rules/sort-maps.mjs";
import { SortType, SortOrder } from "./typings/index.mjs";
import { name } from "./package.json.mjs";
let createConfigWithOptions = (options) => {
  let recommendedRules = {
    [RULE_NAME$5]: [
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
    [RULE_NAME$2]: [
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
    [RULE_NAME$c]: [
      "error",
      {
        "partition-by-comment": false
      }
    ],
    [RULE_NAME]: [
      "error",
      {
        "spread-last": true
      }
    ],
    [RULE_NAME$e]: ["error"],
    [RULE_NAME$d]: ["error"],
    [RULE_NAME$1]: ["error"],
    [RULE_NAME$g]: ["error"],
    [RULE_NAME$9]: ["error"],
    [RULE_NAME$a]: ["error"],
    [RULE_NAME$b]: ["error"],
    [RULE_NAME$f]: ["error"],
    [RULE_NAME$6]: ["error"],
    [RULE_NAME$7]: ["error"],
    [RULE_NAME$4]: ["error"],
    [RULE_NAME$3]: ["error"],
    [RULE_NAME$8]: ["error"]
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
    [RULE_NAME]: sortArrayIncludes,
    [RULE_NAME$1]: sortAstroAttributes,
    [RULE_NAME$2]: sortClasses,
    [RULE_NAME$3]: sortEnums,
    [RULE_NAME$4]: sortExports,
    [RULE_NAME$5]: sortImports,
    [RULE_NAME$6]: sortInterfaces,
    [RULE_NAME$7]: sortJsxProps,
    [RULE_NAME$8]: sortMaps,
    [RULE_NAME$9]: sortNamedExports,
    [RULE_NAME$a]: sortNamedImports,
    [RULE_NAME$b]: sortObjectTypes,
    [RULE_NAME$c]: sortObjects,
    [RULE_NAME$d]: sortSvelteAttributes,
    [RULE_NAME$e]: sortIntersectionTypes,
    [RULE_NAME$f]: sortUnionTypes,
    [RULE_NAME$g]: sortVueAttributes
  },
  configs: {
    "recommended-alphabetical": createConfigWithOptions({
      type: SortType.alphabetical,
      order: SortOrder.asc,
      "ignore-case": false
    }),
    "recommended-natural": createConfigWithOptions({
      type: SortType.natural,
      order: SortOrder.asc,
      "ignore-case": false
    }),
    "recommended-line-length": createConfigWithOptions({
      type: SortType["line-length"],
      order: SortOrder.desc
    })
  },
  name
};
export {
  mod as default
};
