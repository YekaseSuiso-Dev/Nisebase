"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let rangeToDiff = (range) => {
  let [from, to] = range;
  return to - from;
};
exports.rangeToDiff = rangeToDiff;
