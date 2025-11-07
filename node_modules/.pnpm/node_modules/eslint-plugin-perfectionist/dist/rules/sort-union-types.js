"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const createEslintRule = require("../utils/create-eslint-rule.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-union-types";
const sortUnionTypes = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted union types"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
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
          "nullable-last": {
            type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedUnionTypesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    TSUnionType: (node) => {
      let options = complete.complete(context.options.at(0), {
        type: index.SortType.alphabetical,
        "nullable-last": false,
        "ignore-case": false,
        order: index.SortOrder.asc
      });
      let nodes = node.types.map((type) => ({
        group: type.type === "TSNullKeyword" || type.type === "TSUndefinedKeyword" ? "nullable" : "unknown",
        name: context.sourceCode.text.slice(...type.range),
        size: rangeToDiff.rangeToDiff(type.range),
        node: type
      }));
      pairwise.pairwise(nodes, (left, right) => {
        let compareValue = isPositive.isPositive(compare.compare(left, right, options));
        if (options["nullable-last"]) {
          if (left.group === "nullable" && right.group === "unknown") {
            compareValue = true;
          } else if (left.group === "unknown" && right.group === "nullable") {
            compareValue = false;
          }
        }
        if (compareValue) {
          context.report({
            messageId: "unexpectedUnionTypesOrder",
            data: {
              left: toSingleLine.toSingleLine(left.name),
              right: toSingleLine.toSingleLine(right.name)
            },
            node: right.node,
            fix: (fixer) => {
              let sortedNodes = [];
              if (options["nullable-last"]) {
                let nullable = [];
                let nonNullable = nodes.filter((currentNode) => {
                  if (currentNode.group === "nullable") {
                    nullable.push(currentNode);
                    return false;
                  }
                  return true;
                });
                sortedNodes = [
                  ...sortNodes.sortNodes(nonNullable, options),
                  ...sortNodes.sortNodes(nullable, options)
                ];
              } else {
                sortedNodes = sortNodes.sortNodes(nodes, options);
              }
              return makeFixes.makeFixes(fixer, nodes, sortedNodes, context.sourceCode);
            }
          });
        }
      });
    }
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortUnionTypes;
