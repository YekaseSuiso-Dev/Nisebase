"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const isPartitionComment = require("../utils/is-partition-comment.js");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getCommentBefore = require("../utils/get-comment-before.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-enums";
const sortEnums = createEslintRule.createEslintRule({
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
              index.SortType.alphabetical,
              index.SortType.natural,
              index.SortType["line-length"]
            ],
            default: index.SortType.alphabetical,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          order: {
            enum: [index.SortOrder.asc, index.SortOrder.desc],
            default: index.SortOrder.asc,
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
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    TSEnumDeclaration: (node) => {
      if (node.members.length > 1 && node.members.every(({ initializer }) => initializer)) {
        let options = complete.complete(context.options.at(0), {
          type: index.SortType.alphabetical,
          order: index.SortOrder.asc,
          "ignore-case": false,
          "partition-by-comment": false
        });
        let partitionComment = options["partition-by-comment"];
        let formattedMembers = node.members.reduce(
          (accumulator, member) => {
            let comment = getCommentBefore.getCommentBefore(member, context.sourceCode);
            if (partitionComment && comment && isPartitionComment.isPartitionComment(partitionComment, comment.value)) {
              accumulator.push([]);
            }
            let name = member.id.type === "Literal" ? `${member.id.value}` : `${context.sourceCode.text.slice(...member.id.range)}`;
            let sortingNode = {
              name,
              node: member,
              size: rangeToDiff.rangeToDiff(member.range)
            };
            accumulator.at(-1).push(sortingNode);
            return accumulator;
          },
          [[]]
        );
        for (let nodes of formattedMembers) {
          pairwise.pairwise(nodes, (left, right) => {
            if (isPositive.isPositive(compare.compare(left, right, options))) {
              context.report({
                messageId: "unexpectedEnumsOrder",
                data: {
                  left: toSingleLine.toSingleLine(left.name),
                  right: toSingleLine.toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => makeFixes.makeFixes(
                  fixer,
                  nodes,
                  sortNodes.sortNodes(nodes, options),
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
exports.RULE_NAME = RULE_NAME;
exports.default = sortEnums;
