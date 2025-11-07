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
const RULE_NAME = "sort-maps";
const sortMaps = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted Map elements"
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
      unexpectedMapElementsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    NewExpression: (node) => {
      if (node.callee.type === "Identifier" && node.callee.name === "Map" && node.arguments.length && node.arguments[0].type === "ArrayExpression") {
        let [{ elements }] = node.arguments;
        if (elements.length > 1) {
          let options = complete.complete(context.options.at(0), {
            type: index.SortType.alphabetical,
            "ignore-case": false,
            order: index.SortOrder.asc
          });
          let parts = elements.reduce(
            (accumulator, element) => {
              if (element === null || element.type === "SpreadElement") {
                accumulator.push([]);
              } else {
                accumulator.at(-1).push(element);
              }
              return accumulator;
            },
            [[]]
          );
          for (let part of parts) {
            let nodes = part.map((element) => {
              let name;
              if (element.type === "ArrayExpression") {
                let [left] = element.elements;
                if (!left) {
                  name = `${left}`;
                } else if (left.type === "Literal") {
                  name = left.raw;
                } else {
                  name = context.sourceCode.text.slice(...left.range);
                }
              } else {
                name = context.sourceCode.text.slice(...element.range);
              }
              return {
                size: rangeToDiff.rangeToDiff(element.range),
                node: element,
                name
              };
            });
            pairwise.pairwise(nodes, (left, right) => {
              if (isPositive.isPositive(compare.compare(left, right, options))) {
                context.report({
                  messageId: "unexpectedMapElementsOrder",
                  data: {
                    left: toSingleLine.toSingleLine(left.name),
                    right: toSingleLine.toSingleLine(right.name)
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
      }
    }
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortMaps;
