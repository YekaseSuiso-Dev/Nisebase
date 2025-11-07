"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const types = require("@typescript-eslint/types");
let isMemberOptional = (node) => {
  switch (node.type) {
    case types.AST_NODE_TYPES.TSMethodSignature:
    case types.AST_NODE_TYPES.TSPropertySignature:
      return node.optional;
  }
  return false;
};
exports.isMemberOptional = isMemberOptional;
