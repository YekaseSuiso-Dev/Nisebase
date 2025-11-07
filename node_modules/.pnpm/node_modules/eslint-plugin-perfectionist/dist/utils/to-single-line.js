"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let toSingleLine = (string) => string.replaceAll(/\s\s+/g, " ").trim();
exports.toSingleLine = toSingleLine;
