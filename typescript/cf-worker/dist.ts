/**
 * Make sure you have Git, pnpm and Wrangler installed before running this script.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

import { template, formatLocaleString, getTimezoneOffset } from 'utils'
import { version, homepage } from '../package.json'

// Define some constants
const COMMAND = {
  Build: 'pnpm run build:min',
  GetWranglerVersion: 'wrangler --version',
  GetGitCommitHash: 'git rev-parse HEAD',
} as const
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FILE = {
  Input: path.join(__dirname, './dist/main.js'),
  EnsuredDirs: ['./dist', '../.dist'],
  Outputs: [
    path.join(__dirname, `./dist/worker_${version}.js`),
    path.join(__dirname, `../.dist/worker_${version}.js`),
  ],
}

/**
 * A simple wrap of `child_process.execSync`
 */
function exec(command: string, search?: RegExp, defaultStr?: string): string {
  try {
    const stdout = execSync(command, { encoding: 'utf8' })
    const [, result] = search?.exec(stdout) || ['', defaultStr || '']
    return result
  } catch (e) {
    return `${e}`
  }
}

function dist() {
  // Prepare
  const wranglerVersion = exec(COMMAND.GetWranglerVersion, /(\d[\d.]+)/, 'unknown version')
  const gitCommitHash = exec(COMMAND.GetGitCommitHash, /([a-z\d]{40})\s*/, 'unknown commit')

  // Ensure the dirs used to store the artifacts exists
  FILE.EnsuredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }
  })

  // Build
  exec(COMMAND.Build)

  // Start timing now
  const NOW = Date.now()

  // Read the original built file
  const originalContent = fs.readFileSync(FILE.Input, 'utf8')

  // Remove unimportant comments (especially `//# sourceMappingURL`)
  let newContent = originalContent.replaceAll(/^\/\/.*/gm, '')

  // Replace the placeholders
  newContent = template(newContent, {
    gitCommitHash,
    buildDate: new Date(NOW).toISOString().replace(/\.\d+Z$/, 'Z'),
    toolVersion: wranglerVersion,
  })

  // Generate the final comments
  const comments = `// ${homepage}
// version: ${version}
// build: ${formatLocaleString(NOW)} GMT${getTimezoneOffset()}
// wrangler: ${wranglerVersion}
`

  // Then write all the content to a new file
  FILE.Outputs.forEach(dest => {
    fs.writeFileSync(dest, comments + '\n' + newContent, 'utf8')
    console.log('\n`worker.js` has been saved in:\n', dest)
  })
}

// Now start the process
dist()
