"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const naturalCompare = require("natural-compare-lite");
const index = require("../typings/index.js");
let compare = (a, b, options) => {
  var _a, _b;
  if ((_a = b.dependencies) == null ? void 0 : _a.includes(a.name)) {
    return -1;
  } else if ((_b = a.dependencies) == null ? void 0 : _b.includes(b.name)) {
    return 1;
  }
  let orderCoefficient = options.order === "asc" ? 1 : -1;
  let sortingFunction;
  let formatString = (string) => options["ignore-case"] ? string.toLowerCase() : string;
  if (options.type === index.SortType.alphabetical) {
    sortingFunction = (aNode, bNode) => formatString(aNode.name).localeCompare(formatString(bNode.name));
  } else if (options.type === index.SortType.natural) {
    sortingFunction = (aNode, bNode) => naturalCompare(formatString(aNode.name), formatString(bNode.name));
  } else {
    sortingFunction = (aNode, bNode) => {
      let aSize = aNode.size;
      let bSize = bNode.size;
      let maxLineLength = options["max-line-length"];
      if (maxLineLength) {
        let isTooLong = (size, node) => size > maxLineLength && node.hasMultipleImportDeclarations;
        if (isTooLong(aSize, aNode)) {
          aSize = aNode.name.length + 10;
        }
        if (isTooLong(bSize, bNode)) {
          bSize = bNode.name.length + 10;
        }
      }
      return aSize - bSize;
    };
  }
  return orderCoefficient * sortingFunction(a, b);
};
exports.compare = compare;
