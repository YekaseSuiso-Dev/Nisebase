import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { getGroupNumber } from "../utils/get-group-number.mjs";
import { getNodeRange } from "../utils/get-node-range.mjs";
import { toSingleLine } from "../utils/to-single-line.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { useGroups } from "../utils/use-groups.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-classes";
const sortClasses = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted classes"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          type: {
            enum: [
              SortType.alphabetical,
              SortType.natural,
              SortType["line-length"]
            ],
            default: SortType.alphabetical,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          order: {
            enum: [SortOrder.asc, SortOrder.desc],
            default: SortOrder.asc,
            type: "string"
          },
          groups: {
            type: "array",
            default: []
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedClassesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    ClassBody: (node) => {
      if (node.body.length > 1) {
        let options = complete(context.options.at(0), {
          type: SortType.alphabetical,
          order: SortOrder.asc,
          "ignore-case": false,
          groups: ["property", "constructor", "method", "unknown"]
        });
        let nodes = node.body.map((member) => {
          var _a;
          let name;
          let { getGroup, defineGroup } = useGroups(options.groups);
          if (member.type === "StaticBlock") {
            name = "static";
          } else if (member.type === "TSIndexSignature") {
            name = context.sourceCode.text.slice(
              member.range.at(0),
              ((_a = member.typeAnnotation) == null ? void 0 : _a.range.at(0)) ?? member.range.at(1)
            );
          } else {
            if (member.key.type === "Identifier") {
              ({ name } = member.key);
            } else {
              name = context.sourceCode.text.slice(...member.key.range);
            }
          }
          let isPrivate = name.startsWith("_") || name.startsWith("#");
          let decorated = "decorators" in member && member.decorators.length > 0;
          if (member.type === "MethodDefinition") {
            if (member.kind === "constructor") {
              defineGroup("constructor");
            }
            let isPrivateMethod = member.accessibility === "private" || isPrivate;
            let isStaticMethod = member.static;
            if (decorated) {
              if (member.kind === "get") {
                defineGroup("decorated-get-method");
              }
              if (member.kind === "set") {
                defineGroup("decorated-set-method");
              }
              defineGroup("decorated-method");
            }
            if (isPrivateMethod && isStaticMethod) {
              defineGroup("static-private-method");
            }
            if (isPrivateMethod) {
              defineGroup("private-method");
            }
            if (isStaticMethod) {
              defineGroup("static-method");
            }
            if (member.kind === "get") {
              defineGroup("get-method");
            }
            if (member.kind === "set") {
              defineGroup("set-method");
            }
            defineGroup("method");
          } else if (member.type === "TSIndexSignature") {
            defineGroup("index-signature");
          } else if (member.type === "AccessorProperty") {
            if (decorated) {
              if (member.accessibility === "private" || isPrivate) {
                defineGroup("private-decorated-accessor-property");
              }
              defineGroup("decorated-accessor-property");
            }
          } else if (member.type === "PropertyDefinition") {
            if (decorated) {
              if (member.accessibility === "private" || isPrivate) {
                defineGroup("private-decorated-property");
              }
              defineGroup("decorated-property");
            }
            if (member.accessibility === "private" || isPrivate) {
              defineGroup("private-property");
            }
            if (member.static) {
              defineGroup("static-property");
            }
            defineGroup("property");
          }
          return {
            size: rangeToDiff(member.range),
            group: getGroup(),
            node: member,
            name
          };
        });
        pairwise(nodes, (left, right) => {
          let leftNum = getGroupNumber(options.groups, left);
          let rightNum = getGroupNumber(options.groups, right);
          if (left.name !== right.name && (leftNum > rightNum || leftNum === rightNum && isPositive(compare(left, right, options)))) {
            context.report({
              messageId: "unexpectedClassesOrder",
              data: {
                left: toSingleLine(left.name),
                right: toSingleLine(right.name)
              },
              node: right.node,
              fix: (fixer) => {
                let fixes = [];
                let grouped = nodes.reduce(
                  (accumulator, sortingNode) => {
                    let groupNum = getGroupNumber(options.groups, sortingNode);
                    if (!(groupNum in accumulator)) {
                      accumulator[groupNum] = [sortingNode];
                    } else {
                      accumulator[groupNum] = sortNodes(
                        [...accumulator[groupNum], sortingNode],
                        options
                      );
                    }
                    return accumulator;
                  },
                  {}
                );
                let formatted = Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).reduce(
                  (accumulator, group) => [
                    ...accumulator,
                    ...grouped[group]
                  ],
                  []
                );
                for (let i = 0, max = formatted.length; i < max; i++) {
                  fixes.push(
                    fixer.replaceTextRange(
                      getNodeRange(nodes.at(i).node, context.sourceCode),
                      context.sourceCode.text.slice(
                        ...getNodeRange(
                          formatted.at(i).node,
                          context.sourceCode
                        )
                      )
                    )
                  );
                }
                return fixes;
              }
            });
          }
        });
      }
    }
  })
});
export {
  RULE_NAME,
  sortClasses as default
};
