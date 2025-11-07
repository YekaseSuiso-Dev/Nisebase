import { getCommentAfter } from "./get-comment-after.mjs";
import { getNodeRange } from "./get-node-range.mjs";
let makeFixes = (fixer, nodes, sortedNodes, source, additionalOptions) => {
  var _a, _b;
  let fixes = [];
  let isSingleline = ((_a = nodes.at(0)) == null ? void 0 : _a.node.loc.start.line) === ((_b = nodes.at(-1)) == null ? void 0 : _b.node.loc.end.line);
  for (let i = 0, max = nodes.length; i < max; i++) {
    let { node } = nodes.at(i);
    fixes.push(
      fixer.replaceTextRange(
        getNodeRange(node, source, additionalOptions),
        source.text.slice(
          ...getNodeRange(sortedNodes.at(i).node, source, additionalOptions)
        )
      )
    );
    let commentAfter = getCommentAfter(sortedNodes.at(i).node, source);
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
export {
  makeFixes
};
