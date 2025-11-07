import { minimatch } from "minimatch";
import { isPartitionComment } from "../utils/is-partition-comment.mjs";
import { getCommentBefore } from "../utils/get-comment-before.mjs";
import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { getLinesBetween } from "../utils/get-lines-between.mjs";
import { getGroupNumber } from "../utils/get-group-number.mjs";
import { getNodeParent } from "../utils/get-node-parent.mjs";
import { toSingleLine } from "../utils/to-single-line.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { useGroups } from "../utils/use-groups.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-objects";
const sortObjects = createEslintRule({
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
              SortType.alphabetical,
              SortType.natural,
              SortType["line-length"]
            ],
            default: SortType.alphabetical,
            type: "string"
          },
          order: {
            enum: [SortOrder.asc, SortOrder.desc],
            default: SortOrder.asc,
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
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => {
    let sortObject = (node) => {
      let options = complete(context.options.at(0), {
        "partition-by-new-line": false,
        "partition-by-comment": false,
        type: SortType.alphabetical,
        "styled-components": true,
        "ignore-case": false,
        "ignore-pattern": [],
        order: SortOrder.asc,
        "custom-groups": {},
        groups: []
      });
      let shouldIgnore = false;
      if (options["ignore-pattern"].length) {
        let parent = getNodeParent(node, ["VariableDeclarator", "Property"]);
        let parentId = (parent == null ? void 0 : parent.type) === "VariableDeclarator" ? parent.id : parent == null ? void 0 : parent.key;
        let variableIdentifier = (parentId == null ? void 0 : parentId.type) === "Identifier" ? parentId.name : null;
        if (typeof variableIdentifier === "string" && options["ignore-pattern"].some(
          (pattern) => minimatch(variableIdentifier, pattern, {
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
            let comment = getCommentBefore(prop, context.sourceCode);
            let lastProp = (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1);
            if (options["partition-by-comment"] && comment && isPartitionComment(
              options["partition-by-comment"],
              comment.value
            )) {
              accumulator.push([]);
            }
            let name;
            let position = "ignore";
            let dependencies = [];
            let { getGroup, setCustomGroups } = useGroups(options.groups);
            if (prop.key.type === "Identifier") {
              ({ name } = prop.key);
            } else if (prop.key.type === "Literal") {
              name = `${prop.key.value}`;
            } else {
              name = context.sourceCode.text.slice(...prop.key.range);
            }
            let propSortingNode = {
              size: rangeToDiff(prop.range),
              node: prop,
              name
            };
            if (options["partition-by-new-line"] && lastProp && getLinesBetween(context.sourceCode, lastProp, propSortingNode)) {
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
          pairwise(nodes, (left, right) => {
            let leftNum = getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber(options.groups, right);
            if (leftNum > rightNum || leftNum === rightNum && isPositive(compare(left, right, options))) {
              let fix = (fixer) => {
                let grouped = {};
                for (let currentNode of nodes) {
                  let groupNum = getGroupNumber(options.groups, currentNode);
                  if (!(groupNum in grouped)) {
                    grouped[groupNum] = [currentNode];
                  } else {
                    grouped[groupNum] = sortNodes(
                      [...grouped[groupNum], currentNode],
                      options
                    );
                  }
                }
                let sortedNodes = [];
                for (let group of Object.keys(grouped).sort(
                  (a, b) => Number(a) - Number(b)
                )) {
                  sortedNodes.push(...sortNodes(grouped[group], options));
                }
                return makeFixes(
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
                  left: toSingleLine(left.name),
                  right: toSingleLine(right.name)
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
export {
  RULE_NAME,
  sortObjects as default
};
