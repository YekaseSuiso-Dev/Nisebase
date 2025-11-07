"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const minimatch = require("minimatch");
const index = require("../typings/index.js");
const createEslintRule = require("../utils/create-eslint-rule.js");
const isMemberOptional = require("../utils/is-member-optional.js");
const getLinesBetween = require("../utils/get-lines-between.js");
const getGroupNumber = require("../utils/get-group-number.js");
const toSingleLine = require("../utils/to-single-line.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const useGroups = require("../utils/use-groups.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-interfaces";
const sortInterfaces = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted interface properties"
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          "custom-groups": {
            type: "object"
          },
          "optionality-order": {
            enum: [
              index.OptionalityOrder.ignore,
              index.OptionalityOrder["optional-first"],
              index.OptionalityOrder["required-first"]
            ],
            default: index.OptionalityOrder.ignore,
            type: "string"
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
      unexpectedInterfacePropertiesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    TSInterfaceDeclaration: (node) => {
      if (node.body.body.length > 1) {
        let options = complete.complete(context.options.at(0), {
          "optionality-order": index.OptionalityOrder.ignore,
          "partition-by-new-line": false,
          type: index.SortType.alphabetical,
          "ignore-case": false,
          order: index.SortOrder.asc,
          "ignore-pattern": [],
          "custom-groups": {},
          groups: []
        });
        if (!options["ignore-pattern"].some(
          (pattern) => minimatch.minimatch(node.id.name, pattern, {
            nocomment: true
          })
        )) {
          let formattedMembers = node.body.body.reduce(
            (accumulator, element) => {
              var _a, _b, _c, _d;
              if (element.type === "TSCallSignatureDeclaration") {
                accumulator.push([]);
                return accumulator;
              }
              let lastElement = (_a = accumulator.at(-1)) == null ? void 0 : _a.at(-1);
              let name;
              let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
                options.groups
              );
              if (element.type === "TSPropertySignature") {
                if (element.key.type === "Identifier") {
                  ({ name } = element.key);
                } else if (element.key.type === "Literal") {
                  name = `${element.key.value}`;
                } else {
                  let end = ((_b = element.typeAnnotation) == null ? void 0 : _b.range.at(0)) ?? element.range.at(1) - (element.optional ? "?".length : 0);
                  name = context.sourceCode.text.slice(element.range.at(0), end);
                }
              } else if (element.type === "TSIndexSignature") {
                let endIndex = ((_c = element.typeAnnotation) == null ? void 0 : _c.range.at(0)) ?? element.range.at(1);
                name = context.sourceCode.text.slice(
                  element.range.at(0),
                  endIndex
                );
              } else {
                let endIndex = ((_d = element.returnType) == null ? void 0 : _d.range.at(0)) ?? element.range.at(1);
                name = context.sourceCode.text.slice(
                  element.range.at(0),
                  endIndex
                );
              }
              let elementSortingNode = {
                size: rangeToDiff.rangeToDiff(element.range),
                node: element,
                name
              };
              if (options["partition-by-new-line"] && lastElement && getLinesBetween.getLinesBetween(
                context.sourceCode,
                lastElement,
                elementSortingNode
              )) {
                accumulator.push([]);
              }
              setCustomGroups(options["custom-groups"], name);
              if (element.loc.start.line !== element.loc.end.line) {
                defineGroup("multiline");
              }
              accumulator.at(-1).push({
                ...elementSortingNode,
                group: getGroup()
              });
              return accumulator;
            },
            [[]]
          );
          let toSorted = (nodes) => {
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
            return sortedNodes;
          };
          let checkGroupSort = (left, right) => {
            let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
            return leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options));
          };
          let optionalityOrder = options["optionality-order"];
          let checkOrder = (members, left, right, iteration) => {
            if (optionalityOrder === index.OptionalityOrder.ignore) {
              return checkGroupSort(left, right);
            }
            let switchIndex = members.findIndex(
              (_, i) => i && isMemberOptional.isMemberOptional(members[i - 1].node) !== isMemberOptional.isMemberOptional(members[i].node)
            );
            if (iteration < switchIndex && iteration + 1 !== switchIndex) {
              return checkGroupSort(left, right);
            }
            if (isMemberOptional.isMemberOptional(left.node) !== isMemberOptional.isMemberOptional(right.node)) {
              return isMemberOptional.isMemberOptional(left.node) !== (optionalityOrder === index.OptionalityOrder["optional-first"]);
            }
            return checkGroupSort(left, right);
          };
          for (let nodes of formattedMembers) {
            pairwise.pairwise(nodes, (left, right, iteration) => {
              if (checkOrder(nodes, left, right, iteration)) {
                context.report({
                  messageId: "unexpectedInterfacePropertiesOrder",
                  data: {
                    left: toSingleLine.toSingleLine(left.name),
                    right: toSingleLine.toSingleLine(right.name)
                  },
                  node: right.node,
                  fix: (fixer) => {
                    let sortedNodes;
                    if (optionalityOrder !== index.OptionalityOrder.ignore) {
                      let optionalNodes = nodes.filter(
                        (member) => isMemberOptional.isMemberOptional(member.node)
                      );
                      let requiredNodes = nodes.filter(
                        (member) => !isMemberOptional.isMemberOptional(member.node)
                      );
                      sortedNodes = optionalityOrder === index.OptionalityOrder["optional-first"] ? [
                        ...toSorted(optionalNodes),
                        ...toSorted(requiredNodes)
                      ] : [
                        ...toSorted(requiredNodes),
                        ...toSorted(optionalNodes)
                      ];
                    } else {
                      sortedNodes = toSorted(nodes);
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
    }
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortInterfaces;
