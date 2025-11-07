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
const RULE_NAME = "sort-intersection-types";
const sortIntersectionTypes = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted intersection types"
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
      unexpectedIntersectionTypesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    TSIntersectionType: (node) => {
      let options = complete(context.options.at(0), {
        type: SortType.alphabetical,
        "ignore-case": false,
        order: SortOrder.asc
      });
      let nodes = node.types.map((type) => ({
        group: type.type === "TSNullKeyword" || type.type === "TSUndefinedKeyword" ? "nullable" : "unknown",
        name: context.sourceCode.text.slice(...type.range),
        size: rangeToDiff(type.range),
        node: type
      }));
      pairwise(nodes, (left, right) => {
        let compareValue = isPositive(compare(left, right, options));
        if (compareValue) {
          context.report({
            messageId: "unexpectedIntersectionTypesOrder",
            data: {
              left: toSingleLine(left.name),
              right: toSingleLine(right.name)
            },
            node: right.node,
            fix: (fixer) => {
              let sortedNodes = sortNodes(nodes, options);
              return makeFixes(fixer, nodes, sortedNodes, context.sourceCode);
            }
          });
        }
      });
    }
  })
});
export {
  RULE_NAME,
  sortIntersectionTypes as default
};
