import mod from "../index.mjs";
const recommendedAlphabetical = {
  rules: mod.configs["recommended-alphabetical"].rules,
  plugins: {
    perfectionist: mod
  }
};
export {
  recommendedAlphabetical as default
};
