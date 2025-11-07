"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const createEslintRule = require("../utils/create-eslint-rule.js");
const getGroupNumber = require("../utils/get-group-number.js");
const getNodeRange = require("../utils/get-node-range.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const sortNodes = require("../utils/sort-nodes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-classes";
const sortClasses = createEslintRule.createEslintRule({
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
              index.SortType.alphabetical,
              index.SortType.natural,
              index.SortType["line-length"]
            ],
            default: index.SortType.alphabetical,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          order: {
            enum: [index.SortOrder.asc, index.SortOrder.desc],
            default: index.SortOrder.asc,
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
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    ClassBody: (node) => {
      if (node.body.length > 1) {
        let options = complete.complete(context.options.at(0), {
          type: index.SortType.alphabetical,
          order: index.SortOrder.asc,
          "ignore-case": false,
          groups: ["property", "constructor", "method", "unknown"]
        });
        let nodes = node.body.map((member) => {
          var _a;
          let name;
          let { getGroup, defineGroup } = useGroups.useGroups(options.groups);
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
            size: rangeToDiff.rangeToDiff(member.range),
            group: getGroup(),
            node: member,
            name
          };
        });
        pairwise.pairwise(nodes, (left, right) => {
          let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
          let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
          if (left.name !== right.name && (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options)))) {
            context.report({
              messageId: "unexpectedClassesOrder",
              data: {
                left: toSingleLine.toSingleLine(left.name),
                right: toSingleLine.toSingleLine(right.name)
              },
              node: right.node,
              fix: (fixer) => {
                let fixes = [];
                let grouped = nodes.reduce(
                  (accumulator, sortingNode) => {
                    let groupNum = getGroupNumber.getGroupNumber(options.groups, sortingNode);
                    if (!(groupNum in accumulator)) {
                      accumulator[groupNum] = [sortingNode];
                    } else {
                      accumulator[groupNum] = sortNodes.sortNodes(
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
                      getNodeRange.getNodeRange(nodes.at(i).node, context.sourceCode),
                      context.sourceCode.text.slice(
                        ...getNodeRange.getNodeRange(
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
exports.RULE_NAME = RULE_NAME;
exports.default = sortClasses;
