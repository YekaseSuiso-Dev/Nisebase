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
const RULE_NAME = "sort-array-includes";
const sortArrayIncludes = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted arrays before include method"
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
          "spread-last": {
            type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedArrayIncludesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    MemberExpression: (node) => {
      if ((node.object.type === "ArrayExpression" || node.object.type === "NewExpression") && node.property.type === "Identifier" && node.property.name === "includes") {
        let elements = node.object.type === "ArrayExpression" ? node.object.elements : node.object.arguments;
        if (elements.length > 1) {
          let options = complete.complete(context.options.at(0), {
            type: index.SortType.alphabetical,
            order: index.SortOrder.asc,
            "ignore-case": false,
            "spread-last": false
          });
          let nodes = elements.reduce(
            (accumulator, element) => {
              if (element !== null) {
                accumulator.at(0).push({
                  name: element.type === "Literal" ? `${element.value}` : context.sourceCode.text.slice(...element.range),
                  size: rangeToDiff.rangeToDiff(element.range),
                  type: element.type,
                  node: element
                });
              }
              return accumulator;
            },
            [[], []]
          ).flat();
          pairwise.pairwise(nodes, (left, right) => {
            let compareValue;
            if (options["spread-last"] && left.node.type === "Literal" && right.node.type === "SpreadElement") {
              compareValue = false;
            } else if (options["spread-last"] && left.node.type === "SpreadElement" && right.node.type === "Literal") {
              compareValue = true;
            } else {
              compareValue = isPositive.isPositive(compare.compare(left, right, options));
            }
            if (compareValue) {
              context.report({
                messageId: "unexpectedArrayIncludesOrder",
                data: {
                  left: toSingleLine.toSingleLine(left.name),
                  right: toSingleLine.toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => {
                  let sortedNodes = sortNodes.sortNodes(nodes, options);
                  if (options["spread-last"]) {
                    for (let i = 0, max = sortedNodes.length; i < max; i++) {
                      if (sortedNodes.at(i).node.type === "SpreadElement") {
                        sortedNodes.push(sortedNodes.splice(i, 1).at(0));
                      }
                    }
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
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortArrayIncludes;
