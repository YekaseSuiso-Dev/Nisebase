import { minimatch } from "minimatch";
let isPartitionComment = (partitionComment, comment) => Array.isArray(partitionComment) && partitionComment.some(
  (pattern) => minimatch(comment.trim(), pattern, {
    nocomment: true
  })
) || typeof partitionComment === "string" && minimatch(comment.trim(), partitionComment, {
  nocomment: true
}) || partitionComment === true;
export {
  isPartitionComment
};
