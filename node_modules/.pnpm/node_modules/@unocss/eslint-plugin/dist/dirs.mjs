import { fileURLToPath } from 'node:url';

const distDir = fileURLToPath(new URL("../dist", import.meta.url));

export { distDir };
