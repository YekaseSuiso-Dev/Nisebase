"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const minimatch = require("minimatch");
let useGroups = (groups) => {
  let group;
  let defineGroup = (value) => {
    if (!group && groups.flat().includes(value)) {
      group = value;
    }
  };
  let setCustomGroups = (customGroups, name) => {
    if (customGroups) {
      for (let [key, pattern] of Object.entries(customGroups)) {
        if (Array.isArray(pattern) && pattern.some(
          (patternValue) => minimatch.minimatch(name, patternValue, {
            nocomment: true
          })
        )) {
          defineGroup(key);
        }
        if (typeof pattern === "string" && minimatch.minimatch(name, pattern, {
          nocomment: true
        })) {
          defineGroup(key);
        }
      }
    }
  };
  return {
    getGroup: () => group ?? "unknown",
    setCustomGroups,
    defineGroup
  };
};
exports.useGroups = useGroups;
