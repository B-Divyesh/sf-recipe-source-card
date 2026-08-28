import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve('.output');
const files = await readdir(output);
const zip = files
  .filter((file) => file.endsWith('.zip') && file.includes('chrome'))
  .sort()
  .at(-1);

if (!zip) throw new Error('WXT did not create a Chrome extension zip in .output/');

const destination = resolve('site/public/downloads');
await mkdir(destination, { recursive: true });
await copyFile(resolve(output, zip), resolve(destination, 'recipe-source-card-chrome.zip'));
console.log(`Staged ${zip} for the landing site.`);
