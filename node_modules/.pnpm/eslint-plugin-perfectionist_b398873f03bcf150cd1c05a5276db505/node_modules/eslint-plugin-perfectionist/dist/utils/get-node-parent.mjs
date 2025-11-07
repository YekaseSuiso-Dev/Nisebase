let getNodeParent = (node, type) => {
  let types = Array.isArray(type) ? type : [type];
  let { parent } = node;
  while (parent) {
    if (types.includes(parent.type)) {
      return parent;
    }
    ({ parent } = parent);
  }
  return null;
};
export {
  getNodeParent
};
