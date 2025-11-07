"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenOnSameLine = exports.isClosingBraceToken = exports.isClosingBracketToken = exports.isNotClosingParenToken = exports.isClosingParenToken = exports.isEqualSign = exports.isCommaToken = exports.isCommentToken = exports.LINEBREAK_MATCHER = void 0;
exports.LINEBREAK_MATCHER = /\r\n|[\n\r\u2028\u2029]/u;
function isCommentToken(token) {
    return Boolean(token && token.type === "Block");
}
exports.isCommentToken = isCommentToken;
function isCommaToken(token) {
    return token != null && token.value === "," && token.type === "Punctuator";
}
exports.isCommaToken = isCommaToken;
function isEqualSign(token) {
    return token != null && token.type === "Punctuator" && token.value === "=";
}
exports.isEqualSign = isEqualSign;
function isClosingParenToken(token) {
    return token != null && token.value === ")" && token.type === "Punctuator";
}
exports.isClosingParenToken = isClosingParenToken;
exports.isNotClosingParenToken = negate(isClosingParenToken);
function isClosingBracketToken(token) {
    return token != null && token.value === "]" && token.type === "Punctuator";
}
exports.isClosingBracketToken = isClosingBracketToken;
function isClosingBraceToken(token) {
    return token != null && token.value === "}" && token.type === "Punctuator";
}
exports.isClosingBraceToken = isClosingBraceToken;
function isTokenOnSameLine(left, right) {
    var _a, _b;
    return ((_a = left === null || left === void 0 ? void 0 : left.loc) === null || _a === void 0 ? void 0 : _a.end.line) === ((_b = right === null || right === void 0 ? void 0 : right.loc) === null || _b === void 0 ? void 0 : _b.start.line);
}
exports.isTokenOnSameLine = isTokenOnSameLine;
function negate(f) {
    return ((token) => !f(token));
}
