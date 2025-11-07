"use strict";
const index = require("../index.js");
const recommendedLineLength = {
  rules: index.configs["recommended-line-length"].rules,
  plugins: {
    perfectionist: index
  }
};
module.exports = recommendedLineLength;
