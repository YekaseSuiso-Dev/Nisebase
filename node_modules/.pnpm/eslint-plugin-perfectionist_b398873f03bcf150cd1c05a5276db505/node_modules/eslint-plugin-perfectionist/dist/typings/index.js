"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var SortType = /* @__PURE__ */ ((SortType2) => {
  SortType2["alphabetical"] = "alphabetical";
  SortType2["line-length"] = "line-length";
  SortType2["natural"] = "natural";
  return SortType2;
})(SortType || {});
var SortOrder = /* @__PURE__ */ ((SortOrder2) => {
  SortOrder2["desc"] = "desc";
  SortOrder2["asc"] = "asc";
  return SortOrder2;
})(SortOrder || {});
var GroupKind = /* @__PURE__ */ ((GroupKind2) => {
  GroupKind2["values-first"] = "values-first";
  GroupKind2["types-first"] = "types-first";
  GroupKind2["mixed"] = "mixed";
  return GroupKind2;
})(GroupKind || {});
var OptionalityOrder = /* @__PURE__ */ ((OptionalityOrder2) => {
  OptionalityOrder2["optional-first"] = "optional-first";
  OptionalityOrder2["required-first"] = "required-first";
  OptionalityOrder2["ignore"] = "ignore";
  return OptionalityOrder2;
})(OptionalityOrder || {});
exports.GroupKind = GroupKind;
exports.OptionalityOrder = OptionalityOrder;
exports.SortOrder = SortOrder;
exports.SortType = SortType;
