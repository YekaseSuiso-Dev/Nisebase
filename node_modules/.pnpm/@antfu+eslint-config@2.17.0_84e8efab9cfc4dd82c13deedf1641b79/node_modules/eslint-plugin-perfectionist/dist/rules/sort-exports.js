"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const createEslintRule = require("../utils/create-eslint-rule.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-exports";
const sortExports = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted exports"
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
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedExportsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => {
    let options = complete.complete(context.options.at(0), {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc,
      "ignore-case": false
    });
    let parts = [[]];
    let registerNode = (node) => {
      parts.at(-1).push({
        size: rangeToDiff.rangeToDiff(node.range),
        name: node.source.value,
        node
      });
    };
    return {
      ExportAllDeclaration: registerNode,
      ExportNamedDeclaration: (node) => {
        if (node.source !== null) {
          registerNode(node);
        }
      },
      "Program:exit": () => {
        for (let nodes of parts) {
          pairwise.pairwise(nodes, (left, right) => {
            if (isPositive.isPositive(compare.compare(left, right, options))) {
              context.report({
                messageId: "unexpectedExportsOrder",
                data: {
                  left: left.name,
                  right: right.name
                },
                node: right.node,
                fix: (fixer) => makeFixes.makeFixes(
                  fixer,
                  nodes,
                  sortNodes.sortNodes(nodes, options),
                  context.sourceCode
                )
              });
            }
          });
        }
      }
    };
  }
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortExports;
