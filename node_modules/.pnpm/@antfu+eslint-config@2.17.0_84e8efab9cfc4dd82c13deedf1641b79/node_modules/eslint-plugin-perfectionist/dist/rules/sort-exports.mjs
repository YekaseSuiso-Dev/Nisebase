import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-exports";
const sortExports = createEslintRule({
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
      unexpectedExportsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => {
    let options = complete(context.options.at(0), {
      type: SortType.alphabetical,
      order: SortOrder.asc,
      "ignore-case": false
    });
    let parts = [[]];
    let registerNode = (node) => {
      parts.at(-1).push({
        size: rangeToDiff(node.range),
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
          pairwise(nodes, (left, right) => {
            if (isPositive(compare(left, right, options))) {
              context.report({
                messageId: "unexpectedExportsOrder",
                data: {
                  left: left.name,
                  right: right.name
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
    };
  }
});
export {
  RULE_NAME,
  sortExports as default
};
