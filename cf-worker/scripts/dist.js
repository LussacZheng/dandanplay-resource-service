'use strict'

/**
 * Make sure you have Git and Wrangler installed before running this script
 */

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

const { template, formatLocaleString, getTimezoneOffset } = require('./helper')
const { version, homepage } = require('../package.json')

// Define some constants and variables
const COMMAND = {
  Build: 'wrangler build',
  GetWranglerVersion: 'wrangler --version',
  GetGitCommitHash: 'git rev-parse HEAD',
}
const FILE = {
  ForBuild: {
    Target: path.join(__dirname, '../src/api/self.js'),
    Backup: path.join(__dirname, '../src/api/self.js.backup'),
  },
  ForDist: {
    Input: path.join(__dirname, '../dist/worker.js'),
    Output: path.join(__dirname, `../dist/worker_${version}.js`),
  },
}
const NOW = Date.now()
let wranglerVersion, gitCommitHash

/**
 * Prepare
 */
function prepare() {
  try {
    const stdout = execSync(COMMAND.GetWranglerVersion)
    wranglerVersion = /wrangler ([\d\.]+)\s*/.exec(stdout)[1]
  } catch {
    wranglerVersion = 'unknown version'
  }

  try {
    const stdout = execSync(COMMAND.GetGitCommitHash)
    gitCommitHash = /([a-z\d]{40})\s*/.exec(stdout)[1]
  } catch {
    gitCommitHash = 'unknown commit'
  }
}

/**
 * Pre-build
 */
function preBuild() {
  // Rename the target file and copy it back
  fs.renameSync(FILE.ForBuild.Target, FILE.ForBuild.Backup)
  fs.copyFileSync(FILE.ForBuild.Backup, FILE.ForBuild.Target)

  // Then replace the placeholders in the new target file.
  const originalContent = fs.readFileSync(FILE.ForBuild.Target, 'utf8')
  fs.writeFileSync(
    FILE.ForBuild.Target,
    template(originalContent, {
      gitCommitHash,
      buildDate: new Date(NOW).toISOString().replace(/\.\d+Z$/, 'Z'),
      wranglerVersion,
    }),
    'utf8',
  )
}

/**
 * Build
 */
function build() {
  execSync(COMMAND.Build)
}

/**
 * Post-build
 */
function postBuild() {
  // Remove the new target file
  fs.rmSync(FILE.ForBuild.Target)

  // Rename the backup file to its original filename
  fs.renameSync(FILE.ForBuild.Backup, FILE.ForBuild.Target)
}

/**
 * Dist
 */
function dist() {
  // Generate the final comments
  const comments = `// ${homepage}
// version: ${version}
// build: ${formatLocaleString(NOW)} GMT${getTimezoneOffset()}
// wrangler: ${wranglerVersion}
`
  // Write to new file
  const originalContent = fs.readFileSync(FILE.ForDist.Input, 'utf8')
  fs.writeFileSync(FILE.ForDist.Output, comments + '\n' + originalContent, 'utf8')

  console.log('`worker.js` has been saved in:\n', FILE.ForDist.Output)
}

/**
 * Now start the process
 */
prepare()
preBuild()
build()
postBuild()
dist()
