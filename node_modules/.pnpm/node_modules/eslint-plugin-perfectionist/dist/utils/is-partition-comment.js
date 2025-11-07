"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const minimatch = require("minimatch");
let isPartitionComment = (partitionComment, comment) => Array.isArray(partitionComment) && partitionComment.some(
  (pattern) => minimatch.minimatch(comment.trim(), pattern, {
    nocomment: true
  })
) || typeof partitionComment === "string" && minimatch.minimatch(comment.trim(), partitionComment, {
  nocomment: true
}) || partitionComment === true;
exports.isPartitionComment = isPartitionComment;
