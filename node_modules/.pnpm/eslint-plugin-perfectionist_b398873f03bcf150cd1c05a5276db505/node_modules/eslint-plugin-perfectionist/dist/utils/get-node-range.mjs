import { ASTUtils } from "@typescript-eslint/utils";
import { isPartitionComment } from "./is-partition-comment.mjs";
import { getCommentBefore } from "./get-comment-before.mjs";
let getNodeRange = (node, sourceCode, additionalOptions) => {
  var _a;
  let start = node.range.at(0);
  let end = node.range.at(1);
  let raw = sourceCode.text.slice(start, end);
  if (ASTUtils.isParenthesized(node, sourceCode)) {
    let bodyOpeningParen = sourceCode.getTokenBefore(
      node,
      ASTUtils.isOpeningParenToken
    );
    let bodyClosingParen = sourceCode.getTokenAfter(
      node,
      ASTUtils.isClosingParenToken
    );
    start = bodyOpeningParen.range.at(0);
    end = bodyClosingParen.range.at(1);
  }
  let comment = getCommentBefore(node, sourceCode);
  if (raw.endsWith(";") || raw.endsWith(",")) {
    let tokensAfter = sourceCode.getTokensAfter(node, {
      includeComments: true,
      count: 2
    });
    if (node.loc.start.line === ((_a = tokensAfter.at(1)) == null ? void 0 : _a.loc.start.line)) {
      end -= 1;
    }
  }
  if (comment && !isPartitionComment(
    (additionalOptions == null ? void 0 : additionalOptions.partitionComment) ?? false,
    comment.value
  )) {
    start = comment.range.at(0);
  }
  return [start, end];
};
export {
  getNodeRange
};
