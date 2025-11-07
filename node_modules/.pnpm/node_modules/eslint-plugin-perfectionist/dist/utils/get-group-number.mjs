let getGroupNumber = (groups, node) => {
  for (let i = 0, max = groups.length; i < max; i++) {
    let currentGroup = groups[i];
    if (node.group === currentGroup || Array.isArray(currentGroup) && typeof node.group === "string" && currentGroup.includes(node.group)) {
      return i;
    }
  }
  return groups.length;
};
export {
  getGroupNumber
};
