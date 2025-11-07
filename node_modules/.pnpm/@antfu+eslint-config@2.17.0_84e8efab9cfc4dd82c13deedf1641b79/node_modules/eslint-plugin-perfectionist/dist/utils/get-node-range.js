"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const utils = require("@typescript-eslint/utils");
const isPartitionComment = require("./is-partition-comment.js");
const getCommentBefore = require("./get-comment-before.js");
let getNodeRange = (node, sourceCode, additionalOptions) => {
  var _a;
  let start = node.range.at(0);
  let end = node.range.at(1);
  let raw = sourceCode.text.slice(start, end);
  if (utils.ASTUtils.isParenthesized(node, sourceCode)) {
    let bodyOpeningParen = sourceCode.getTokenBefore(
      node,
      utils.ASTUtils.isOpeningParenToken
    );
    let bodyClosingParen = sourceCode.getTokenAfter(
      node,
      utils.ASTUtils.isClosingParenToken
    );
    start = bodyOpeningParen.range.at(0);
    end = bodyClosingParen.range.at(1);
  }
  let comment = getCommentBefore.getCommentBefore(node, sourceCode);
  if (raw.endsWith(";") || raw.endsWith(",")) {
    let tokensAfter = sourceCode.getTokensAfter(node, {
      includeComments: true,
      count: 2
    });
    if (node.loc.start.line === ((_a = tokensAfter.at(1)) == null ? void 0 : _a.loc.start.line)) {
      end -= 1;
    }
  }
  if (comment && !isPartitionComment.isPartitionComment(
    (additionalOptions == null ? void 0 : additionalOptions.partitionComment) ?? false,
    comment.value
  )) {
    start = comment.range.at(0);
  }
  return [start, end];
};
exports.getNodeRange = getNodeRange;
