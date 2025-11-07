"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const path = require("node:path");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getGroupNumber = require("../utils/get-group-number.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const makeFixes = require("../utils/make-fixes.js");
const sortNodes = require("../utils/sort-nodes.js");
const pairwise = require("../utils/pairwise.js");
const complete = require("../utils/complete.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-astro-attributes";
const sortAstroAttributes = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted Astro attributes"
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
      unexpectedAstroAttributesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  // @ts-ignore
  create: (context) => {
    if (path.extname(context.filename) !== ".astro") {
      return {};
    }
    return {
      JSXElement: (node) => {
        let { attributes } = node.openingElement;
        if (attributes.length > 1) {
          let options = complete.complete(context.options.at(0), {
            type: index.SortType.alphabetical,
            order: index.SortOrder.asc,
            "ignore-case": false,
            "custom-groups": {},
            groups: []
          });
          let parts = attributes.reduce(
            (accumulator, attribute) => {
              if (attribute.type === "JSXSpreadAttribute") {
                accumulator.push([]);
                return accumulator;
              }
              let name = typeof attribute.name.name === "string" ? attribute.name.name : context.sourceCode.text.slice(...attribute.name.range);
              let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
                options.groups
              );
              setCustomGroups(options["custom-groups"], name);
              if (attribute.type === "AstroShorthandAttribute") {
                defineGroup("astro-shorthand");
                defineGroup("shorthand");
              }
              if (attribute.value === null) {
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
                  messageId: "unexpectedAstroAttributesOrder",
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
exports.default = sortAstroAttributes;
