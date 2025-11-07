import mod from "../index.mjs";
const recommendedLineLength = {
  rules: mod.configs["recommended-line-length"].rules,
  plugins: {
    perfectionist: mod
  }
};
export {
  recommendedLineLength as default
};
