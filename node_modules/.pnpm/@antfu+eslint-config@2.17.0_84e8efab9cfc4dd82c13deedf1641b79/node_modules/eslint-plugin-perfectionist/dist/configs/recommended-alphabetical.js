"use strict";
const index = require("../index.js");
const recommendedAlphabetical = {
  rules: index.configs["recommended-alphabetical"].rules,
  plugins: {
    perfectionist: index
  }
};
module.exports = recommendedAlphabetical;
