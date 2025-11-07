"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilename = exports.getSourceCode = void 0;
const eslint_compat_utils_1 = require("eslint-compat-utils");
function getSourceCode(context) {
    return (0, eslint_compat_utils_1.getSourceCode)(context);
}
exports.getSourceCode = getSourceCode;
function getFilename(context) {
    return (0, eslint_compat_utils_1.getFilename)(context);
}
exports.getFilename = getFilename;
