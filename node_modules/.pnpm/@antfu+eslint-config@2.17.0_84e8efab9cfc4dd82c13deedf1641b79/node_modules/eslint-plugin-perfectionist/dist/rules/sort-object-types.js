"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const createEslintRule = require("../utils/create-eslint-rule.js");
const getLinesBetween = require("../utils/get-lines-between.js");
const getGroupNumber = require("../utils/get-group-number.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const useGroups = require("../utils/use-groups.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-object-types";
const sortObjectTypes = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted object types"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          "custom-groups": {
            type: "object"
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
          groups: {
            type: "array",
            default: []
          },
          "partition-by-new-line": {
            type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedObjectTypesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    TSTypeLiteral: (node) => {
      if (node.members.length > 1) {
        let options = complete.complete(context.options.at(0), {
          "partition-by-new-line": false,
          type: index.SortType.alphabetical,
          "ignore-case": false,
          order: index.SortOrder.asc,
          "custom-groups": {},
          groups: []
        });
        let formattedMembers = node.members.reduce(
          (accumulator, member) => {
            var _a, _b, _c, _d;
            let name;
            let raw = context.sourceCode.text.slice(
              member.range.at(0),
              member.range.at(1)
            );
            let lastMember = (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1);
            let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
              options.groups
            );
            let formatName = (value) => value.replace(/(,|;)$/, "");
            if (member.type === "TSPropertySignature") {
              if (member.key.type === "Identifier") {
                ({ name } = member.key);
              } else if (member.key.type === "Literal") {
                name = `${member.key.value}`;
              } else {
                name = context.sourceCode.text.slice(
                  member.range.at(0),
                  (_b = member.typeAnnotation) == null ? void 0 : _b.range.at(0)
                );
              }
            } else if (member.type === "TSIndexSignature") {
              let endIndex = ((_c = member.typeAnnotation) == null ? void 0 : _c.range.at(0)) ?? member.range.at(1);
              name = formatName(
                context.sourceCode.text.slice(member.range.at(0), endIndex)
              );
            } else {
              name = formatName(
                context.sourceCode.text.slice(
                  member.range.at(0),
                  member.range.at(1)
                )
              );
            }
            setCustomGroups(options["custom-groups"], name);
            if (member.loc.start.line !== member.loc.end.line) {
              defineGroup("multiline");
            }
            let endsWithComma = raw.endsWith(";") || raw.endsWith(",");
            let endSize = endsWithComma ? 1 : 0;
            let memberSortingNode = {
              size: rangeToDiff.rangeToDiff(member.range) - endSize,
              node: member,
              name
            };
            if (options["partition-by-new-line"] && lastMember && getLinesBetween.getLinesBetween(context.sourceCode, lastMember, memberSortingNode)) {
              accumulator.push([]);
            }
            (_d = accumulator.at(-1)) == null ? void 0 : _d.push({
              ...memberSortingNode,
              group: getGroup()
            });
            return accumulator;
          },
          [[]]
        );
        for (let nodes of formattedMembers) {
          pairwise.pairwise(nodes, (left, right) => {
            let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
            if (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options))) {
              context.report({
                messageId: "unexpectedObjectTypesOrder",
                data: {
                  left: toSingleLine.toSingleLine(left.name),
                  right: toSingleLine.toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => {
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
                    context.sourceCode
                  );
                }
              });
            }
          });
        }
      }
    }
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortObjectTypes;
