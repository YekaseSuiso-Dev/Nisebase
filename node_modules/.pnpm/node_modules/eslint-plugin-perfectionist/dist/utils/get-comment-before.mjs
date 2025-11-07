let getCommentBefore = (node, source) => {
  let [tokenBefore, tokenOrCommentBefore] = source.getTokensBefore(node, {
    filter: ({ value, type }) => !(type === "Punctuator" && [",", ";"].includes(value)),
    includeComments: true,
    count: 2
  });
  if (((tokenOrCommentBefore == null ? void 0 : tokenOrCommentBefore.type) === "Block" || (tokenOrCommentBefore == null ? void 0 : tokenOrCommentBefore.type) === "Line") && node.loc.start.line - tokenOrCommentBefore.loc.end.line <= 1 && (tokenBefore == null ? void 0 : tokenBefore.loc.end.line) !== tokenOrCommentBefore.loc.start.line) {
    return tokenOrCommentBefore;
  }
  return null;
};
export {
  getCommentBefore
};
