"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const getCommentAfter = require("./get-comment-after.js");
const getNodeRange = require("./get-node-range.js");
let makeFixes = (fixer, nodes, sortedNodes, source, additionalOptions) => {
  var _a, _b;
  let fixes = [];
  let isSingleline = ((_a = nodes.at(0)) == null ? void 0 : _a.node.loc.start.line) === ((_b = nodes.at(-1)) == null ? void 0 : _b.node.loc.end.line);
  for (let i = 0, max = nodes.length; i < max; i++) {
    let { node } = nodes.at(i);
    fixes.push(
      fixer.replaceTextRange(
        getNodeRange.getNodeRange(node, source, additionalOptions),
        source.text.slice(
          ...getNodeRange.getNodeRange(sortedNodes.at(i).node, source, additionalOptions)
        )
      )
    );
    let commentAfter = getCommentAfter.getCommentAfter(sortedNodes.at(i).node, source);
    if (commentAfter && !isSingleline) {
      let tokenBefore = source.getTokenBefore(commentAfter);
      let range = [
        tokenBefore.range.at(1),
        commentAfter.range.at(1)
      ];
      fixes.push(fixer.replaceTextRange(range, ""));
      let tokenAfterNode = source.getTokenAfter(node);
      fixes.push(
        fixer.insertTextAfter(
          (tokenAfterNode == null ? void 0 : tokenAfterNode.loc.end.line) === node.loc.end.line ? tokenAfterNode : node,
          source.text.slice(...range)
        )
      );
    }
  }
  return fixes;
};
exports.makeFixes = makeFixes;
