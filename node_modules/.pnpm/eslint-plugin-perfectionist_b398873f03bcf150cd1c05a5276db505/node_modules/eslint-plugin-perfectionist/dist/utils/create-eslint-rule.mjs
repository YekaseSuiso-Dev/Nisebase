import { ESLintUtils } from "@typescript-eslint/utils";
let createEslintRule = ESLintUtils.RuleCreator(
  (ruleName) => `https://eslint-plugin-perfectionist.azat.io/rules/${ruleName}`
);
export {
  createEslintRule
};
