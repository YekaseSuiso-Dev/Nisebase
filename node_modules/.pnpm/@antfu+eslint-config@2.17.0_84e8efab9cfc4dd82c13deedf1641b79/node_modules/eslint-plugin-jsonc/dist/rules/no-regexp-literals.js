"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const eslint_compat_utils_1 = require("eslint-compat-utils");
exports.default = (0, utils_1.createRule)("no-regexp-literals", {
    meta: {
        docs: {
            description: "disallow RegExp literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpected: "RegExp literals are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        const sourceCode = (0, eslint_compat_utils_1.getSourceCode)(context);
        if (!sourceCode.parserServices.isJSON) {
            return {};
        }
        return {
            JSONLiteral(node) {
                if (node.regex) {
                    context.report({
                        loc: node.loc,
                        messageId: "unexpected",
                    });
                }
            },
        };
    },
});
