"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const path = require("node:path");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getGroupNumber = require("../utils/get-group-number.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-svelte-attributes";
const sortSvelteAttributes = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted Svelte attributes"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          "custom-groups": {
            type: "object"
          },
          type: {
            enum: [
              index.SortType.alphabetical,
              index.SortType.natural,
              index.SortType["line-length"]
            ],
            default: index.SortType.alphabetical,
            type: "string"
          },
          order: {
            enum: [index.SortOrder.asc, index.SortOrder.desc],
            default: index.SortOrder.asc,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          groups: {
            type: "array"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedSvelteAttributesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => {
    if (path.extname(context.filename) !== ".svelte") {
      return {};
    }
    return {
      SvelteStartTag: (node) => {
        if (node.attributes.length > 1) {
          let options = complete.complete(context.options.at(0), {
            type: index.SortType.alphabetical,
            order: index.SortOrder.asc,
            "ignore-case": false,
            "custom-groups": {},
            groups: []
          });
          let parts = node.attributes.reduce(
            (accumulator, attribute) => {
              if (attribute.type === "SvelteSpreadAttribute") {
                accumulator.push([]);
                return accumulator;
              }
              let name;
              let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
                options.groups
              );
              if (attribute.key.type === "SvelteSpecialDirectiveKey") {
                name = context.sourceCode.text.slice(...attribute.key.range);
              } else {
                if (typeof attribute.key.name === "string") {
                  ({ name } = attribute.key);
                } else {
                  name = context.sourceCode.text.slice(...attribute.key.range);
                }
              }
              setCustomGroups(options["custom-groups"], name);
              if (attribute.type === "SvelteShorthandAttribute") {
                defineGroup("svelte-shorthand");
                defineGroup("shorthand");
              }
              if (!("value" in attribute) || Array.isArray(attribute.value) && !attribute.value.at(0)) {
                defineGroup("shorthand");
              }
              if (attribute.loc.start.line !== attribute.loc.end.line) {
                defineGroup("multiline");
              }
              accumulator.at(-1).push({
                size: rangeToDiff.rangeToDiff(attribute.range),
                node: attribute,
                group: getGroup(),
                name
              });
              return accumulator;
            },
            [[]]
          );
          for (let nodes of parts) {
            pairwise.pairwise(nodes, (left, right) => {
              let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
              let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
              if (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options))) {
                context.report({
                  messageId: "unexpectedSvelteAttributesOrder",
                  data: {
                    left: left.name,
                    right: right.name
                  },
                  node: right.node,
                  fix: (fixer) => {
                    let grouped = {};
                    for (let currentNode of nodes) {
                      let groupNum = getGroupNumber.getGroupNumber(options.groups, currentNode);
                      if (!(groupNum in grouped)) {
                        grouped[groupNum] = [currentNode];
                      } else {
                        grouped[groupNum] = sortNodes.sortNodes(
                          [...grouped[groupNum], currentNode],
                          options
                        );
                      }
                    }
                    let sortedNodes = [];
                    for (let group of Object.keys(grouped).sort(
                      (a, b) => Number(a) - Number(b)
                    )) {
                      sortedNodes.push(...sortNodes.sortNodes(grouped[group], options));
                    }
                    return makeFixes.makeFixes(
                      fixer,
                      nodes,
                      sortedNodes,
                      context.sourceCode
                    );
                  }
                });
              }
            });
          }
        }
      }
    };
  }
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortSvelteAttributes;
