'use strict';

const node_url = require('node:url');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
const distDir = node_url.fileURLToPath(new URL("../dist", (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('dirs.cjs', document.baseURI).href))));

exports.distDir = distDir;
