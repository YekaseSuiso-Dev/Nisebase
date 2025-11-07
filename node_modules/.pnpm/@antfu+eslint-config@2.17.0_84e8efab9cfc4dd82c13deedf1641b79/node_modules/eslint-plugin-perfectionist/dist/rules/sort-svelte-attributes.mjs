import path from "node:path";
import { createEslintRule } from "../utils/create-eslint-rule.mjs";
import { getGroupNumber } from "../utils/get-group-number.mjs";
import { rangeToDiff } from "../utils/range-to-diff.mjs";
import { isPositive } from "../utils/is-positive.mjs";
import { SortType, SortOrder } from "../typings/index.mjs";
import { useGroups } from "../utils/use-groups.mjs";
import { sortNodes } from "../utils/sort-nodes.mjs";
import { makeFixes } from "../utils/make-fixes.mjs";
import { complete } from "../utils/complete.mjs";
import { pairwise } from "../utils/pairwise.mjs";
import { compare } from "../utils/compare.mjs";
const RULE_NAME = "sort-svelte-attributes";
const sortSvelteAttributes = createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted Svelte attributes"
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
            type: "array"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      unexpectedSvelteAttributesOrder: 'Expected "{{right}}" to come before "{{left}}"'
    }
  },
  defaultOptions: [
    {
      type: SortType.alphabetical,
      order: SortOrder.asc
    }
  ],
  create: (context) => {
    if (path.extname(context.filename) !== ".svelte") {
      return {};
    }
    return {
      SvelteStartTag: (node) => {
        if (node.attributes.length > 1) {
          let options = complete(context.options.at(0), {
            type: SortType.alphabetical,
            order: SortOrder.asc,
            "ignore-case": false,
            "custom-groups": {},
            groups: []
          });
          let parts = node.attributes.reduce(
            (accumulator, attribute) => {
              if (attribute.type === "SvelteSpreadAttribute") {
                accumulator.push([]);
                return accumulator;
              }
              let name;
              let { getGroup, defineGroup, setCustomGroups } = useGroups(
                options.groups
              );
              if (attribute.key.type === "SvelteSpecialDirectiveKey") {
                name = context.sourceCode.text.slice(...attribute.key.range);
              } else {
                if (typeof attribute.key.name === "string") {
                  ({ name } = attribute.key);
                } else {
                  name = context.sourceCode.text.slice(...attribute.key.range);
                }
              }
              setCustomGroups(options["custom-groups"], name);
              if (attribute.type === "SvelteShorthandAttribute") {
                defineGroup("svelte-shorthand");
                defineGroup("shorthand");
              }
              if (!("value" in attribute) || Array.isArray(attribute.value) && !attribute.value.at(0)) {
                defineGroup("shorthand");
              }
              if (attribute.loc.start.line !== attribute.loc.end.line) {
                defineGroup("multiline");
              }
              accumulator.at(-1).push({
                size: rangeToDiff(attribute.range),
                node: attribute,
                group: getGroup(),
                name
              });
              return accumulator;
            },
            [[]]
          );
          for (let nodes of parts) {
            pairwise(nodes, (left, right) => {
              let leftNum = getGroupNumber(options.groups, left);
              let rightNum = getGroupNumber(options.groups, right);
              if (leftNum > rightNum || leftNum === rightNum && isPositive(compare(left, right, options))) {
                context.report({
                  messageId: "unexpectedSvelteAttributesOrder",
                  data: {
                    left: left.name,
                    right: right.name
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
    };
  }
});
export {
  RULE_NAME,
  sortSvelteAttributes as default
};
