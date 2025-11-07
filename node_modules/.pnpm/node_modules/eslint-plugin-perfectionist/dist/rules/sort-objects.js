"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const minimatch = require("minimatch");
const isPartitionComment = require("../utils/is-partition-comment.js");
const getCommentBefore = require("../utils/get-comment-before.js");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getLinesBetween = require("../utils/get-lines-between.js");
const getGroupNumber = require("../utils/get-group-number.js");
const getNodeParent = require("../utils/get-node-parent.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const makeFixes = require("../utils/make-fixes.js");
const sortNodes = require("../utils/sort-nodes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-objects";
const sortObjects = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted objects"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          "custom-groups": {
            type: "object"
          },
          "partition-by-comment": {
            type: ["boolean", "string", "array"],
            default: false
          },
          "partition-by-new-line": {
            type: "boolean",
            default: false
          },
          "styled-components": {
            type: "boolean",
            default: true
          },
          type: {
            enum: [
              index.SortType.alphabetical,
              index.SortType.natural,
              index.SortType["line-length"]
            ],
            default: index.SortType.alphabetical,
            type: "string"
          },
          order: {
            enum: [index.SortOrder.asc, index.SortOrder.desc],
            default: index.SortOrder.asc,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          "ignore-pattern": {
            items: {
              type: "string"
            },
            type: "array"
          },
          groups: {
            type: "array"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedObjectsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => {
    let sortObject = (node) => {
      let options = complete.complete(context.options.at(0), {
        "partition-by-new-line": false,
        "partition-by-comment": false,
        type: index.SortType.alphabetical,
        "styled-components": true,
        "ignore-case": false,
        "ignore-pattern": [],
        order: index.SortOrder.asc,
        "custom-groups": {},
        groups: []
      });
      let shouldIgnore = false;
      if (options["ignore-pattern"].length) {
        let parent = getNodeParent.getNodeParent(node, ["VariableDeclarator", "Property"]);
        let parentId = (parent == null ? void 0 : parent.type) === "VariableDeclarator" ? parent.id : parent == null ? void 0 : parent.key;
        let variableIdentifier = (parentId == null ? void 0 : parentId.type) === "Identifier" ? parentId.name : null;
        if (typeof variableIdentifier === "string" && options["ignore-pattern"].some(
          (pattern) => minimatch.minimatch(variableIdentifier, pattern, {
            nocomment: true
          })
        )) {
          shouldIgnore = true;
        }
      }
      if (!shouldIgnore && node.properties.length > 1) {
        let isStyledCallExpression = (identifier) => identifier.type === "Identifier" && identifier.name === "styled";
        let isStyledComponents = (styledNode) => styledNode !== void 0 && styledNode.type === "CallExpression" && (styledNode.callee.type === "MemberExpression" && isStyledCallExpression(styledNode.callee.object) || styledNode.callee.type === "CallExpression" && isStyledCallExpression(styledNode.callee.callee));
        if (!options["styled-components"] && (isStyledComponents(node.parent) || node.parent.type === "ArrowFunctionExpression" && isStyledComponents(node.parent.parent))) {
          return;
        }
        let formatProperties = (props) => props.reduce(
          (accumulator, prop) => {
            var _a;
            if (prop.type === "SpreadElement" || prop.type === "RestElement") {
              accumulator.push([]);
              return accumulator;
            }
            let comment = getCommentBefore.getCommentBefore(prop, context.sourceCode);
            let lastProp = (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1);
            if (options["partition-by-comment"] && comment && isPartitionComment.isPartitionComment(
              options["partition-by-comment"],
              comment.value
            )) {
              accumulator.push([]);
            }
            let name;
            let position = "ignore";
            let dependencies = [];
            let { getGroup, setCustomGroups } = useGroups.useGroups(options.groups);
            if (prop.key.type === "Identifier") {
              ({ name } = prop.key);
            } else if (prop.key.type === "Literal") {
              name = `${prop.key.value}`;
            } else {
              name = context.sourceCode.text.slice(...prop.key.range);
            }
            let propSortingNode = {
              size: rangeToDiff.rangeToDiff(prop.range),
              node: prop,
              name
            };
            if (options["partition-by-new-line"] && lastProp && getLinesBetween.getLinesBetween(context.sourceCode, lastProp, propSortingNode)) {
              accumulator.push([]);
            }
            if (prop.value.type === "AssignmentPattern") {
              let addDependencies = (value2) => {
                if (value2.right.type === "Identifier") {
                  dependencies.push(value2.right.name);
                }
                let handleComplexExpression = (expression) => {
                  let nodes = [];
                  switch (expression.type) {
                    case "ArrowFunctionExpression":
                      nodes.push(expression.body);
                      break;
                    case "ConditionalExpression":
                      nodes.push(expression.consequent, expression.alternate);
                      break;
                    case "LogicalExpression":
                    case "BinaryExpression":
                      nodes.push(expression.left, expression.right);
                      break;
                    case "CallExpression":
                      nodes.push(...expression.arguments);
                      break;
                  }
                  nodes.forEach((nestedNode) => {
                    if (nestedNode.type === "Identifier") {
                      dependencies.push(nestedNode.name);
                    }
                    if (nestedNode.type === "BinaryExpression" || nestedNode.type === "ConditionalExpression") {
                      handleComplexExpression(nestedNode);
                    }
                  });
                };
                switch (value2.right.type) {
                  case "ArrowFunctionExpression":
                  case "ConditionalExpression":
                  case "LogicalExpression":
                  case "BinaryExpression":
                  case "CallExpression":
                    handleComplexExpression(value2.right);
                    break;
                }
              };
              addDependencies(prop.value);
            }
            setCustomGroups(options["custom-groups"], name);
            let value = {
              ...propSortingNode,
              group: getGroup(),
              dependencies,
              position
            };
            accumulator.at(-1).push(value);
            return accumulator;
          },
          [[]]
        );
        for (let nodes of formatProperties(node.properties)) {
          pairwise.pairwise(nodes, (left, right) => {
            let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
            if (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options))) {
              let fix = (fixer) => {
                let grouped = {};
                for (let currentNode of nodes) {
                  let groupNum = getGroupNumber.getGroupNumber(options.groups, currentNode);
                  if (!(groupNum in grouped)) {
                    grouped[groupNum] = [currentNode];
                  } else {
                    grouped[groupNum] = sortNodes.sortNodes(
                      [...grouped[groupNum], currentNode],
                      options
                    );
                  }
                }
                let sortedNodes = [];
                for (let group of Object.keys(grouped).sort(
                  (a, b) => Number(a) - Number(b)
                )) {
                  sortedNodes.push(...sortNodes.sortNodes(grouped[group], options));
                }
                return makeFixes.makeFixes(
                  fixer,
                  nodes,
                  sortedNodes,
                  context.sourceCode,
                  {
                    partitionComment: options["partition-by-comment"]
                  }
                );
              };
              context.report({
                messageId: "unexpectedObjectsOrder",
                data: {
                  left: toSingleLine.toSingleLine(left.name),
                  right: toSingleLine.toSingleLine(right.name)
                },
                node: right.node,
                fix
              });
            }
          });
        }
      }
    };
    return {
      ObjectExpression: sortObject,
      ObjectPattern: sortObject
    };
  }
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortObjects;
