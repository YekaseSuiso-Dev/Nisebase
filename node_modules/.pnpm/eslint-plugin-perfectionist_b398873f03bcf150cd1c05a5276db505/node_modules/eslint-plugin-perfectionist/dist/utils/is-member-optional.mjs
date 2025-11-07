import { AST_NODE_TYPES } from "@typescript-eslint/types";
let isMemberOptional = (node) => {
  switch (node.type) {
    case AST_NODE_TYPES.TSMethodSignature:
    case AST_NODE_TYPES.TSPropertySignature:
      return node.optional;
  }
  return false;
};
export {
  isMemberOptional
};
