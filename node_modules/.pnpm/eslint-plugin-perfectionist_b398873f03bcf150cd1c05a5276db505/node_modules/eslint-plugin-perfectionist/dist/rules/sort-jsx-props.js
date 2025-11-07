"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const path = require("node:path");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getGroupNumber = require("../utils/get-group-number.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const makeFixes = require("../utils/make-fixes.js");
const sortNodes = require("../utils/sort-nodes.js");
const pairwise = require("../utils/pairwise.js");
const complete = require("../utils/complete.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-jsx-props";
const sortJsxProps = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted JSX props"
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
          groups: {
            type: "array"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedJSXPropsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => {
    if ([".svelte", ".astro", ".vue"].includes(path.extname(context.filename))) {
      return {};
    }
    return {
      JSXElement: (node) => {
        if (node.openingElement.attributes.length > 1) {
          let options = complete.complete(context.options.at(0), {
            type: index.SortType.alphabetical,
            "ignore-case": false,
            order: index.SortOrder.asc,
            "custom-groups": {},
            groups: []
          });
          let parts = node.openingElement.attributes.reduce(
            (accumulator, attribute) => {
              if (attribute.type === "JSXSpreadAttribute") {
                accumulator.push([]);
                return accumulator;
              }
              let name = attribute.name.type === "JSXNamespacedName" ? `${attribute.name.namespace.name}:${attribute.name.name.name}` : attribute.name.name;
              let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(
                options.groups
              );
              setCustomGroups(options["custom-groups"], name);
              if (attribute.value === null) {
                defineGroup("shorthand");
              }
              if (attribute.loc.start.line !== attribute.loc.end.line) {
                defineGroup("multiline");
              }
              let jsxNode = {
                size: rangeToDiff.rangeToDiff(attribute.range),
                group: getGroup(),
                node: attribute,
                name
              };
              accumulator.at(-1).push(jsxNode);
              return accumulator;
            },
            [[]]
          );
          for (let nodes of parts) {
            pairwise.pairwise(nodes, (left, right) => {
              let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
              let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
              if (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options))) {
                context.report({
                  messageId: "unexpectedJSXPropsOrder",
                  data: {
                    left: left.name,
                    right: right.name
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
    };
  }
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortJsxProps;
