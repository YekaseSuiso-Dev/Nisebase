"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const node_module = require("node:module");
const minimatch = require("minimatch");
const getCommentBefore = require("../utils/get-comment-before.js");
const createEslintRule = require("../utils/create-eslint-rule.js");
const getLinesBetween = require("../utils/get-lines-between.js");
const getGroupNumber = require("../utils/get-group-number.js");
const getNodeRange = require("../utils/get-node-range.js");
const rangeToDiff = require("../utils/range-to-diff.js");
const isPositive = require("../utils/is-positive.js");
const index = require("../typings/index.js");
const useGroups = require("../utils/use-groups.js");
const sortNodes = require("../utils/sort-nodes.js");
const complete = require("../utils/complete.js");
const pairwise = require("../utils/pairwise.js");
const compare = require("../utils/compare.js");
const RULE_NAME = "sort-imports";
const sortImports = createEslintRule.createEslintRule({
  name: RULE_NAME,
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce sorted imports"
    },
    fixable: "code",
    schema: [
      {
        id: "sort-imports",
        type: "object",
        properties: {
          "custom-groups": {
            type: "object",
            properties: {
              type: {
                type: "object"
              },
              value: {
                type: "object"
              }
            },
            additionalProperties: false
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
          "internal-pattern": {
            items: {
              type: "string"
            },
            type: "array"
          },
          "newlines-between": {
            enum: [
              "ignore",
              "always",
              "never"
              /* never */
            ],
            default: "always",
            type: "string"
          },
          "max-line-length": {
            type: "integer",
            minimum: 0,
            exclusiveMinimum: true
          }
        },
        allOf: [
          { $ref: "#/definitions/max-line-length-requires-line-length-type" }
        ],
        additionalProperties: false,
        dependencies: {
          "max-line-length": ["type"]
        },
        definitions: {
          "is-line-length": {
            properties: {
              type: { enum: [index.SortType["line-length"]], type: "string" }
            },
            required: ["type"],
            type: "object"
          },
          "max-line-length-requires-line-length-type": {
            anyOf: [
              {
                not: { required: ["max-line-length"], type: "object" },
                type: "object"
              },
              { $ref: "#/definitions/is-line-length" }
            ]
          }
        }
      }
    ],
    messages: {
      unexpectedImportsOrder: 'Expected "{{right}}" to come before "{{left}}"',
      missedSpacingBetweenImports: 'Missed spacing between "{{left}}" and "{{right}}" imports',
      extraSpacingBetweenImports: 'Extra spacing between "{{left}}" and "{{right}}" imports'
    }
  },
  defaultOptions: [
    {
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc
    }
  ],
  create: (context) => {
    let options = complete.complete(context.options.at(0), {
      "newlines-between": "always",
      "custom-groups": { type: {}, value: {} },
      "internal-pattern": ["~/**"],
      type: index.SortType.alphabetical,
      order: index.SortOrder.asc,
      "ignore-case": false,
      groups: []
    });
    let hasUnknownGroup = false;
    for (let group of options.groups) {
      if (Array.isArray(group)) {
        for (let subGroup of group) {
          if (subGroup === "unknown") {
            hasUnknownGroup = true;
          }
        }
      } else {
        if (group === "unknown") {
          hasUnknownGroup = true;
        }
      }
    }
    if (!hasUnknownGroup) {
      options.groups = [...options.groups, "unknown"];
    }
    let nodes = [];
    let isSideEffectImport = (node) => node.type === "ImportDeclaration" && node.specifiers.length === 0 && /* Avoid matching on named imports without specifiers */
    !/}\s*from\s+/.test(context.sourceCode.getText(node));
    let computeGroup = (node) => {
      let isStyle = (value) => [".less", ".scss", ".sass", ".styl", ".pcss", ".css", ".sss"].some(
        (extension) => value.endsWith(extension)
      );
      let isIndex = (value) => [
        "./index.d.js",
        "./index.d.ts",
        "./index.js",
        "./index.ts",
        "./index",
        "./",
        "."
      ].includes(value);
      let isParent = (value) => value.indexOf("..") === 0;
      let isSibling = (value) => value.indexOf("./") === 0;
      let { getGroup, defineGroup, setCustomGroups } = useGroups.useGroups(options.groups);
      let isInternal = (nodeElement) => options["internal-pattern"].length && options["internal-pattern"].some(
        (pattern) => minimatch.minimatch(nodeElement.source.value, pattern, {
          nocomment: true
        })
      );
      let isCoreModule = (value) => {
        let bunModules = [
          "bun",
          "bun:ffi",
          "bun:jsc",
          "bun:sqlite",
          "bun:test",
          "bun:wrap",
          "detect-libc",
          "undici",
          "ws"
        ];
        return node_module.builtinModules.includes(
          value.startsWith("node:") ? value.split("node:")[1] : value
        ) || bunModules.includes(value);
      };
      let isExternal = (value) => !(value.startsWith(".") || value.startsWith("/"));
      if (node.importKind === "type") {
        if (node.type === "ImportDeclaration") {
          setCustomGroups(options["custom-groups"].type, node.source.value);
          if (isIndex(node.source.value)) {
            defineGroup("index-type");
          }
          if (isSibling(node.source.value)) {
            defineGroup("sibling-type");
          }
          if (isParent(node.source.value)) {
            defineGroup("parent-type");
          }
          if (isInternal(node)) {
            defineGroup("internal-type");
          }
          if (isCoreModule(node.source.value)) {
            defineGroup("builtin-type");
          }
          if (isExternal(node.source.value)) {
            defineGroup("external-type");
          }
        }
        defineGroup("type");
      }
      if (node.type === "ImportDeclaration") {
        setCustomGroups(options["custom-groups"].value, node.source.value);
        if (isSideEffectImport(node) && isStyle(node.source.value)) {
          defineGroup("side-effect-style");
        }
        if (isSideEffectImport(node)) {
          defineGroup("side-effect");
        }
        if (isStyle(node.source.value)) {
          defineGroup("style");
        }
        if (isIndex(node.source.value)) {
          defineGroup("index");
        }
        if (isSibling(node.source.value)) {
          defineGroup("sibling");
        }
        if (isParent(node.source.value)) {
          defineGroup("parent");
        }
        if (isInternal(node)) {
          defineGroup("internal");
        }
        if (isCoreModule(node.source.value)) {
          defineGroup("builtin");
        }
        if (isExternal(node.source.value)) {
          defineGroup("external");
        }
      }
      return getGroup();
    };
    let hasMultipleImportDeclarations = (node) => node.specifiers.length > 1;
    let registerNode = (node) => {
      let name;
      if (node.type === "ImportDeclaration") {
        name = node.source.value;
      } else {
        if (node.moduleReference.type === "TSExternalModuleReference" && node.moduleReference.expression.type === "Literal") {
          name = `${node.moduleReference.expression.value}`;
        } else {
          name = context.sourceCode.text.slice(...node.moduleReference.range);
        }
      }
      nodes.push({
        size: rangeToDiff.rangeToDiff(node.range),
        group: computeGroup(node),
        name,
        node,
        ...options.type === index.SortType["line-length"] && options["max-line-length"] && {
          hasMultipleImportDeclarations: hasMultipleImportDeclarations(
            node
          )
        }
      });
    };
    return {
      TSImportEqualsDeclaration: registerNode,
      ImportDeclaration: registerNode,
      "Program:exit": () => {
        var _a;
        let hasContentBetweenNodes = (left, right) => !!context.sourceCode.getTokensBetween(
          left.node,
          getCommentBefore.getCommentBefore(right.node, context.sourceCode) || right.node,
          {
            includeComments: true
          }
        ).length;
        let fix = (fixer, nodesToFix) => {
          let fixes = [];
          let grouped = {};
          for (let node of nodesToFix) {
            let groupNum = getGroupNumber.getGroupNumber(options.groups, node);
            if (!(groupNum in grouped)) {
              grouped[groupNum] = [node];
            } else {
              grouped[groupNum] = sortNodes.sortNodes(
                [...grouped[groupNum], node],
                options
              );
            }
          }
          let formatted = Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).reduce(
            (accumulator, group) => [
              ...accumulator,
              ...grouped[group]
            ],
            []
          );
          for (let i = 0, max = formatted.length; i < max; i++) {
            let node = formatted.at(i);
            fixes.push(
              fixer.replaceTextRange(
                getNodeRange.getNodeRange(nodesToFix.at(i).node, context.sourceCode),
                context.sourceCode.text.slice(
                  ...getNodeRange.getNodeRange(node.node, context.sourceCode)
                )
              )
            );
            if (options["newlines-between"] !== "ignore") {
              let nextNode = formatted.at(i + 1);
              if (nextNode) {
                let linesBetweenImports = getLinesBetween.getLinesBetween(
                  context.sourceCode,
                  nodesToFix.at(i),
                  nodesToFix.at(i + 1)
                );
                if (options["newlines-between"] === "always" && getGroupNumber.getGroupNumber(options.groups, node) === getGroupNumber.getGroupNumber(options.groups, nextNode) && linesBetweenImports !== 0 || options["newlines-between"] === "never" && linesBetweenImports > 0) {
                  fixes.push(
                    fixer.removeRange([
                      getNodeRange.getNodeRange(
                        nodesToFix.at(i).node,
                        context.sourceCode
                      ).at(1),
                      getNodeRange.getNodeRange(
                        nodesToFix.at(i + 1).node,
                        context.sourceCode
                      ).at(0) - 1
                    ])
                  );
                }
                if (options["newlines-between"] === "always" && getGroupNumber.getGroupNumber(options.groups, node) !== getGroupNumber.getGroupNumber(options.groups, nextNode) && linesBetweenImports > 1) {
                  fixes.push(
                    fixer.replaceTextRange(
                      [
                        getNodeRange.getNodeRange(
                          nodesToFix.at(i).node,
                          context.sourceCode
                        ).at(1),
                        getNodeRange.getNodeRange(
                          nodesToFix.at(i + 1).node,
                          context.sourceCode
                        ).at(0) - 1
                      ],
                      "\n"
                    )
                  );
                }
                if (options["newlines-between"] === "always" && getGroupNumber.getGroupNumber(options.groups, node) !== getGroupNumber.getGroupNumber(options.groups, nextNode) && linesBetweenImports === 0) {
                  fixes.push(
                    fixer.insertTextAfterRange(
                      getNodeRange.getNodeRange(nodesToFix.at(i).node, context.sourceCode),
                      "\n"
                    )
                  );
                }
              }
            }
          }
          return fixes;
        };
        let splittedNodes = [[]];
        for (let node of nodes) {
          let lastNode = (_a = splittedNodes.at(-1)) == null ? void 0 : _a.at(-1);
          if (lastNode && hasContentBetweenNodes(lastNode, node)) {
            splittedNodes.push([node]);
          } else {
            splittedNodes.at(-1).push(node);
          }
        }
        for (let nodeList of splittedNodes) {
          pairwise.pairwise(nodeList, (left, right) => {
            let leftNum = getGroupNumber.getGroupNumber(options.groups, left);
            let rightNum = getGroupNumber.getGroupNumber(options.groups, right);
            let numberOfEmptyLinesBetween = getLinesBetween.getLinesBetween(
              context.sourceCode,
              left,
              right
            );
            if (!(isSideEffectImport(left.node) && isSideEffectImport(right.node)) && !hasContentBetweenNodes(left, right) && (leftNum > rightNum || leftNum === rightNum && isPositive.isPositive(compare.compare(left, right, options)))) {
              context.report({
                messageId: "unexpectedImportsOrder",
                data: {
                  left: left.name,
                  right: right.name
                },
                node: right.node,
                fix: (fixer) => fix(fixer, nodeList)
              });
            }
            if (options["newlines-between"] === "never" && numberOfEmptyLinesBetween > 0) {
              context.report({
                messageId: "extraSpacingBetweenImports",
                data: {
                  left: left.name,
                  right: right.name
                },
                node: right.node,
                fix: (fixer) => fix(fixer, nodeList)
              });
            }
            if (options["newlines-between"] === "always") {
              if (leftNum < rightNum && numberOfEmptyLinesBetween === 0) {
                context.report({
                  messageId: "missedSpacingBetweenImports",
                  data: {
                    left: left.name,
                    right: right.name
                  },
                  node: right.node,
                  fix: (fixer) => fix(fixer, nodeList)
                });
              } else if (numberOfEmptyLinesBetween > 1 || leftNum === rightNum && numberOfEmptyLinesBetween > 0) {
                context.report({
                  messageId: "extraSpacingBetweenImports",
                  data: {
                    left: left.name,
                    right: right.name
                  },
                  node: right.node,
                  fix: (fixer) => fix(fixer, nodeList)
                });
              }
            }
          });
        }
      }
    };
  }
});
exports.RULE_NAME = RULE_NAME;
exports.default = sortImports;
