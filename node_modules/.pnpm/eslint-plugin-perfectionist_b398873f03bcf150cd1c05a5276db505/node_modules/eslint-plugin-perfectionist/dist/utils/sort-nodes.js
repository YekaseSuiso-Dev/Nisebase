"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const compare = require("./compare.js");
let sortNodes = (nodes, options) => [...nodes].sort((a, b) => compare.compare(a, b, options));
exports.sortNodes = sortNodes;
