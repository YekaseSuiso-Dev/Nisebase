import { compare } from "./compare.mjs";
let sortNodes = (nodes, options) => [...nodes].sort((a, b) => compare(a, b, options));
export {
  sortNodes
};
