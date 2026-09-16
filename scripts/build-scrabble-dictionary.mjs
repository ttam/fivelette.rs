import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import wordListPath from 'word-list';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'public/dictionary/scrabble.txt');
const licenseOutput = resolve(root, 'public/dictionary/scrabble-license.txt');
const words = (await readFile(wordListPath, 'utf8'))
    .split(/\r?\n/)
    .filter(word => /^[a-z]{2,12}$/.test(word));

await writeFile(output, `${words.join('\n')}\n`);
await copyFile(resolve(dirname(wordListPath), 'license'), licenseOutput);

console.log(`Wrote ${words.length.toLocaleString()} words to ${output}`);
