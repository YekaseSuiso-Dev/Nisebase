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
const RULE_NAME = "sort-array-includes";
const sortArrayIncludes = createEslintRule({
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
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    MemberExpression: (node) => {
      if ((node.object.type === "ArrayExpression" || node.object.type === "NewExpression") && node.property.type === "Identifier" && node.property.name === "includes") {
        let elements = node.object.type === "ArrayExpression" ? node.object.elements : node.object.arguments;
        if (elements.length > 1) {
          let options = complete(context.options.at(0), {
            type: SortType.alphabetical,
            order: SortOrder.asc,
            "ignore-case": false,
            "spread-last": false
          });
          let nodes = elements.reduce(
            (accumulator, element) => {
              if (element !== null) {
                accumulator.at(0).push({
                  name: element.type === "Literal" ? `${element.value}` : context.sourceCode.text.slice(...element.range),
                  size: rangeToDiff(element.range),
                  type: element.type,
                  node: element
                });
              }
              return accumulator;
            },
            [[], []]
          ).flat();
          pairwise(nodes, (left, right) => {
            let compareValue;
            if (options["spread-last"] && left.node.type === "Literal" && right.node.type === "SpreadElement") {
              compareValue = false;
            } else if (options["spread-last"] && left.node.type === "SpreadElement" && right.node.type === "Literal") {
              compareValue = true;
            } else {
              compareValue = isPositive(compare(left, right, options));
            }
            if (compareValue) {
              context.report({
                messageId: "unexpectedArrayIncludesOrder",
                data: {
                  left: toSingleLine(left.name),
                  right: toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => {
                  let sortedNodes = sortNodes(nodes, options);
                  if (options["spread-last"]) {
                    for (let i = 0, max = sortedNodes.length; i < max; i++) {
                      if (sortedNodes.at(i).node.type === "SpreadElement") {
                        sortedNodes.push(sortedNodes.splice(i, 1).at(0));
                      }
                    }
                  }
                  return makeFixes(
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
export {
  RULE_NAME,
  sortArrayIncludes as default
};
