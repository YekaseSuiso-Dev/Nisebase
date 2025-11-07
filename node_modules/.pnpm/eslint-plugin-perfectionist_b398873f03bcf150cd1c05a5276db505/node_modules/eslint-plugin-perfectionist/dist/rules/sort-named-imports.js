"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const createEslintRule = require("../utils/create-eslint-rule.js");
const index = require("../typings/index.js");
const getGroupNumber = require("../utils/get-group-number.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const sortNodes = require("../utils/sort-nodes.js");
const makeFixes = require("../utils/make-fixes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-named-imports";
const sortNamedImports = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted named imports"
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
          order: {
            enum: [index.SortOrder.asc, index.SortOrder.desc],
            default: index.SortOrder.asc,
            type: "string"
          },
          "ignore-case": {
            type: "boolean",
            default: false
          },
          "ignore-alias": {
            type: "boolean",
            default: false
          },
          "group-kind": {
            enum: [
              index.GroupKind.mixed,
              index.GroupKind["values-first"],
              index.GroupKind["types-first"]
            ],
            default: index.GroupKind.mixed,
            type: "string"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedNamedImportsOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => ({
    ImportDeclaration: (node) => {
      let specifiers = node.specifiers.filter(
        ({ type }) => type === "ImportSpecifier"
      );
      if (specifiers.length > 1) {
        let options = complete.complete(context.options.at(0), {
          type: index.SortType.alphabetical,
          "ignore-alias": true,
          "ignore-case": false,
          order: index.SortOrder.asc,
          "group-kind": index.GroupKind.mixed
        });
        let nodes = specifiers.map((specifier) => {
          let group;
          let { name } = specifier.local;
          if (specifier.type === "ImportSpecifier") {
            if (options["ignore-alias"]) {
              ({ name } = specifier.imported);
            }
            group = specifier.importKind;
          }
          return {
            size: rangeToDiff.rangeToDiff(specifier.range),
            node: specifier,
            name,
            group
          };
        });
        let shouldGroupByKind = options["group-kind"] !== index.GroupKind.mixed;
        let groupKindOrder = options["group-kind"] === index.GroupKind["values-first"] ? ["value", "type"] : ["type", "value"];
        pairwise.pairwise(nodes, (left, right) => {
          let leftNum = getGroupNumber.getGroupNumber(groupKindOrder, left);
          let rightNum = getGroupNumber.getGroupNumber(groupKindOrder, right);
          if (shouldGroupByKind && leftNum > rightNum || (!shouldGroupByKind || leftNum === rightNum) && isPositive.isPositive(compare.compare(left, right, options))) {
            let sortedNodes = shouldGroupByKind ? groupKindOrder.map((group) => nodes.filter((n) => n.group === group)).map((groupedNodes) => sortNodes.sortNodes(groupedNodes, options)).flat() : sortNodes.sortNodes(nodes, options);
            context.report({
              messageId: "unexpectedNamedImportsOrder",
              data: {
                left: left.name,
                right: right.name
              },
              node: right.node,
              fix: (fixer) => makeFixes.makeFixes(fixer, nodes, sortedNodes, context.sourceCode)
            });
          }
        });
      }
    }
  })
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortNamedImports;
