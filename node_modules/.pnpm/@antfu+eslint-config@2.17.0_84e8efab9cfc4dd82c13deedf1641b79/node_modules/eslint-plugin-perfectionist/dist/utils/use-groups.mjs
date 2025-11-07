import { minimatch } from "minimatch";
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
          (patternValue) => minimatch(name, patternValue, {
            nocomment: true
          })
        )) {
          defineGroup(key);
        }
        if (typeof pattern === "string" && minimatch(name, pattern, {
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
export {
  useGroups
};
