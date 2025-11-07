import process from 'node:process';
import { loadConfig } from '@unocss/config';
import { parseVariantGroup, notNull, collapseVariantGroup, createGenerator } from '@unocss/core';
import { runAsWorker } from 'synckit';

async function sortRules(rules, uno) {
  const unknown = [];
  if (!uno.config.details)
    uno.config.details = true;
  const expandedResult = parseVariantGroup(rules);
  rules = expandedResult.expanded;
  const result = await Promise.all(rules.split(/\s+/g).map(async (i) => {
    const token = await uno.parseToken(i);
    if (token == null) {
      unknown.push(i);
      return void 0;
    }
    const variantRank = (token[0][5]?.variantHandlers?.length || 0) * 1e5;
    const order = token[0][0] + variantRank;
    return [order, i];
  }));
  let sorted = result.filter(notNull).sort((a, b) => {
    let result2 = a[0] - b[0];
    if (result2 === 0)
      result2 = a[1].localeCompare(b[1]);
    return result2;
  }).map((i) => i[1]).join(" ");
  if (expandedResult?.prefixes.length)
    sorted = collapseVariantGroup(sorted, expandedResult.prefixes);
  return [...unknown, sorted].join(" ").trim();
}

var _a;
let promise;
(_a = process.env).ESLINT || (_a.ESLINT = "true");
async function _getGenerator() {
  const { config, sources } = await loadConfig();
  if (!sources.length)
    throw new Error("[@unocss/eslint-plugin] No config file found, create a `uno.config.ts` file in your project root and try again.");
  return createGenerator({
    ...config,
    warn: false
  });
}
async function getGenerator() {
  promise = promise || _getGenerator();
  return await promise;
}
function setGenerator(generator) {
  promise = Promise.resolve(generator);
}
async function actionSort(classes) {
  return await sortRules(classes, await getGenerator());
}
async function actionBlocklist(classes, id) {
  const uno = await getGenerator();
  const blocked = /* @__PURE__ */ new Set();
  const extracted = await uno.applyExtractors(classes, id);
  const values = [...extracted.values()];
  const matchBlocked = async (raw) => {
    if (blocked.has(raw))
      return;
    if (uno.isBlocked(raw)) {
      blocked.add(raw);
      return;
    }
    let current = raw;
    for (const p of uno.config.preprocess)
      current = p(raw);
    const applied = await uno.matchVariants(raw, current);
    if (applied && uno.isBlocked(applied[1]))
      blocked.add(raw);
  };
  await Promise.all(values.map(matchBlocked));
  return [...blocked];
}
async function runAsync(action, ...args) {
  switch (action) {
    case "sort":
      return actionSort(...args);
    case "blocklist":
      return actionBlocklist(...args);
  }
}
function run(action, ...args) {
  return runAsync(action, ...args);
}
runAsWorker(run);

export { getGenerator, run, runAsync, setGenerator };
