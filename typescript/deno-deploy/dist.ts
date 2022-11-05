/**
 * Make sure you have Git, pnpm and Deno installed before running this script.
 */

import * as path from '$/path/mod.ts';
import * as fs from '$/fs/mod.ts';

import { formatLocaleString, getTimezoneOffset, template } from 'utils';
import pkg from '../package.json' assert { type: 'json' };
const { name, homepage, version } = pkg;

// Define some constants
const COMMAND = {
  Build: ['deno', 'task', 'dist:pre'],
  GetDenoVersion: ['deno', '-V'],
  GetGitCommitHash: ['git', 'rev-parse', 'HEAD'],
};
const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
const FILE = {
  Input: {
    main: path.join(__dirname, './main.ts'),
    built: path.join(__dirname, './dist/routes.js'),
  },
  EnsuredDirs: ['./dist', '../.dist'],
  Outputs: [
    path.join(__dirname, `./dist/playground_${version}.js`),
    path.join(__dirname, `../.dist/playground_${version}.js`),
  ],
};
const INJECT_LABEL = '// dist.ts: INJECT BETWEEN';

/**
 * A simple wrap of `child_process.execSync`
 */
async function exec(command: string[], search?: RegExp, defaultStr?: string): Promise<string> {
  try {
    const p = Deno.run({
      cmd: command,
      stdout: 'piped',
    });
    const stdout = new TextDecoder('utf-8').decode(await p.output());
    const [, result] = search?.exec(stdout) || ['', defaultStr || ''];
    return result;
  } catch (e) {
    return `${e}`;
  }
}

async function dist() {
  // Prepare
  const denoVersion = await exec(COMMAND.GetDenoVersion, /(\d[\d.]+)/, 'unknown version');
  const gitCommitHash = await exec(COMMAND.GetGitCommitHash, /([a-z\d]{40})\s*/, 'unknown commit');

  // Ensure the dirs used to store the artifacts exists
  FILE.EnsuredDirs.forEach((dir) => fs.ensureDirSync(dir));

  // Build
  await exec(COMMAND.Build);

  // Start timing now
  const NOW = Date.now();

  // Read the original built file
  const decoder = new TextDecoder('utf-8');
  const mainContent = decoder.decode(Deno.readFileSync(FILE.Input.main));
  const builtContent = decoder.decode(Deno.readFileSync(FILE.Input.built));

  // Remove unimportant comments and useless exports
  let newContent = builtContent
    .replaceAll(/^\/\/.*/gm, '')
    .replaceAll(/^export.*/gm, '')
    .trim();

  // Remove useless field from imported `../package.json`
  newContent = newContent.replace(
    /JSON\.parse\((.*?)\)/s,
    JSON.stringify({
      name,
      version,
      homepage,
    }),
  );

  // Replace the placeholders
  newContent = template(newContent, {
    gitCommitHash,
    buildDate: new Date(NOW).toISOString().replace(/\.\d+Z$/, 'Z'),
    toolVersion: denoVersion,
  });

  // Inject code into `main.ts`
  newContent = mainContent.replace(
    new RegExp(`${INJECT_LABEL}.*${INJECT_LABEL}`, 's'),
    // use a function instead of directly `newContent` here
    // https://stackoverflow.com/a/59697678
    () => newContent,
  );

  // Generate the final comments
  const comments = `// ${homepage}
// version: ${version}
// build: ${formatLocaleString(NOW, undefined)} GMT${getTimezoneOffset()}
// deno: ${denoVersion}
`;

  // Then write all the content to a new file
  FILE.Outputs.forEach((dest) => {
    Deno.writeFileSync(dest, new TextEncoder().encode(comments + '\n' + newContent));
    console.log('\n`playground.js` has been saved in:\n', dest);
  });
}

// Now start the process
dist();
