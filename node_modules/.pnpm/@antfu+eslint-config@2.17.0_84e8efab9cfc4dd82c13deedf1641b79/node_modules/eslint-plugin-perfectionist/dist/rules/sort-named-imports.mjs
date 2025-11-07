import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { SortType, SortOrder, GroupKind } from "../typings/index.mjs";
import { getGroupNumber } from "../utils/get-group-number.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-named-imports";
const sortNamedImports = createEslintRule({
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
          "ignore-alias": {
            type: "boolean",
            default: false
          },
          "group-kind": {
            enum: [
              GroupKind.mixed,
              GroupKind["values-first"],
              GroupKind["types-first"]
            ],
            default: GroupKind.mixed,
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
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => ({
    ImportDeclaration: (node) => {
      let specifiers = node.specifiers.filter(
        ({ type }) => type === "ImportSpecifier"
      );
      if (specifiers.length > 1) {
        let options = complete(context.options.at(0), {
          type: SortType.alphabetical,
          "ignore-alias": true,
          "ignore-case": false,
          order: SortOrder.asc,
          "group-kind": GroupKind.mixed
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
            size: rangeToDiff(specifier.range),
            node: specifier,
            name,
            group
          };
        });
        let shouldGroupByKind = options["group-kind"] !== GroupKind.mixed;
        let groupKindOrder = options["group-kind"] === GroupKind["values-first"] ? ["value", "type"] : ["type", "value"];
        pairwise(nodes, (left, right) => {
          let leftNum = getGroupNumber(groupKindOrder, left);
          let rightNum = getGroupNumber(groupKindOrder, right);
          if (shouldGroupByKind && leftNum > rightNum || (!shouldGroupByKind || leftNum === rightNum) && isPositive(compare(left, right, options))) {
            let sortedNodes = shouldGroupByKind ? groupKindOrder.map((group) => nodes.filter((n) => n.group === group)).map((groupedNodes) => sortNodes(groupedNodes, options)).flat() : sortNodes(nodes, options);
            context.report({
              messageId: "unexpectedNamedImportsOrder",
              data: {
                left: left.name,
                right: right.name
              },
              node: right.node,
              fix: (fixer) => makeFixes(fixer, nodes, sortedNodes, context.sourceCode)
            });
          }
        });
      }
    }
  })
});
export {
  RULE_NAME,
  sortNamedImports as default
};
