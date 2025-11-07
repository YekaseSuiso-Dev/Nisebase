import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { getLinesBetween } from "../utils/get-lines-between.mjs";
import { getGroupNumber } from "../utils/get-group-number.mjs";
import { toSingleLine } from "../utils/to-single-line.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { useGroups } from "../utils/use-groups.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-object-types";
const sortObjectTypes = createEslintRule({
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
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    TSTypeLiteral: (node) => {
      if (node.members.length > 1) {
        let options = complete(context.options.at(0), {
          "partition-by-new-line": false,
          type: SortType.alphabetical,
          "ignore-case": false,
          order: SortOrder.asc,
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
            let { getGroup, defineGroup, setCustomGroups } = useGroups(
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
              size: rangeToDiff(member.range) - endSize,
              node: member,
              name
            };
            if (options["partition-by-new-line"] && lastMember && getLinesBetween(context.sourceCode, lastMember, memberSortingNode)) {
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
          pairwise(nodes, (left, right) => {
            let leftNum = getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber(options.groups, right);
            if (leftNum > rightNum || leftNum === rightNum && isPositive(compare(left, right, options))) {
              context.report({
                messageId: "unexpectedObjectTypesOrder",
                data: {
                  left: toSingleLine(left.name),
                  right: toSingleLine(right.name)
                },
                node: right.node,
                fix: (fixer) => {
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
export {
  RULE_NAME,
  sortObjectTypes as default
};
