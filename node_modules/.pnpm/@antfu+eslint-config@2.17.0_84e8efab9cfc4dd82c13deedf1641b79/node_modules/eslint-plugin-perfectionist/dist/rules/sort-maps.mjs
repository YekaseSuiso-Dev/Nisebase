import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { toSingleLine } from "../utils/to-single-line.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-maps";
const sortMaps = createEslintRule({
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
              SortType.alphabetical,
              SortType.natural,
              SortType["line-length"]
            ],
            default: SortType.alphabetical,
            type: "string"
          },
          order: {
            enum: [SortOrder.asc, SortOrder.desc],
            default: SortOrder.asc,
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
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    NewExpression: (node) => {
      if (node.callee.type === "Identifier" && node.callee.name === "Map" && node.arguments.length && node.arguments[0].type === "ArrayExpression") {
        let [{ elements }] = node.arguments;
        if (elements.length > 1) {
          let options = complete(context.options.at(0), {
            type: SortType.alphabetical,
            "ignore-case": false,
            order: SortOrder.asc
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
                size: rangeToDiff(element.range),
                node: element,
                name
              };
            });
            pairwise(nodes, (left, right) => {
              if (isPositive(compare(left, right, options))) {
                context.report({
                  messageId: "unexpectedMapElementsOrder",
                  data: {
                    left: toSingleLine(left.name),
                    right: toSingleLine(right.name)
                  },
                  node: right.node,
                  fix: (fixer) => makeFixes(
                    fixer,
                    nodes,
                    sortNodes(nodes, options),
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
export {
  RULE_NAME,
  sortMaps as default
};
