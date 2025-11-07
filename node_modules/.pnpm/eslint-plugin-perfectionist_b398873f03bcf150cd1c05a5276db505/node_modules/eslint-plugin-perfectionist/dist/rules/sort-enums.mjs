import { isPartitionComment } from "../utils/is-partition-comment.mjs";
import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { getCommentBefore } from "../utils/get-comment-before.mjs";
import { toSingleLine } from "../utils/to-single-line.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-enums";
const sortEnums = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted TypeScript enums"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          "partition-by-comment": {
            default: false,
            type: ["boolean", "string", "array"]
          },
          type: {
            enum: [
              SortType.alphabetical,
              SortType.natural,
              SortType["line-length"]
            ],
            default: SortType.alphabetical,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          order: {
            enum: [SortOrder.asc, SortOrder.desc],
            default: SortOrder.asc,
            type: "string"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedEnumsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    TSEnumDeclaration: (node) => {
      if (node.members.length > 1 && node.members.every(({ initializer }) => initializer)) {
        let options = complete(context.options.at(0), {
          type: SortType.alphabetical,
          order: SortOrder.asc,
          "ignore-case": false,
          "partition-by-comment": false
        });
        let partitionComment = options["partition-by-comment"];
        let formattedMembers = node.members.reduce(
          (accumulator, member) => {
            let comment = getCommentBefore(member, context.sourceCode);
            if (partitionComment && comment && isPartitionComment(partitionComment, comment.value)) {
              accumulator.push([]);
            }
            let name = member.id.type === "Literal" ? `${member.id.value}` : `${context.sourceCode.text.slice(...member.id.range)}`;
            let sortingNode = {
              name,
              node: member,
              size: rangeToDiff(member.range)
            };
            accumulator.at(-1).push(sortingNode);
            return accumulator;
          },
          [[]]
        );
        for (let nodes of formattedMembers) {
          pairwise(nodes, (left, right) => {
            if (isPositive(compare(left, right, options))) {
              context.report({
                messageId: "unexpectedEnumsOrder",
                data: {
                  left: toSingleLine(left.name),
                  right: toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => makeFixes(
                  fixer,
                  nodes,
                  sortNodes(nodes, options),
                  context.sourceCode,
                  { partitionComment }
                )
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
  sortEnums as default
};
