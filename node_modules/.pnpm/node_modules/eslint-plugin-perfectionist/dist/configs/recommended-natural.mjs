import mod from "../index.mjs";
const recommendedNatural = {
  rules: mod.configs["recommended-natural"].rules,
  plugins: {
    perfectionist: mod
  }
};
export {
  recommendedNatural as default
};
