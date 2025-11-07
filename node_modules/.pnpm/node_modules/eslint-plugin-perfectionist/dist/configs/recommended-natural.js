"use strict";
const index = require("../index.js");
const recommendedNatural = {
  rules: index.configs["recommended-natural"].rules,
  plugins: {
    perfectionist: index
  }
};
module.exports = recommendedNatural;
