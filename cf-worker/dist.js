/**
 * Please do NOT execute this script directly.
 * Please run `wrangler build` first,
 * or make sure that `dist/worker.js` exists first.
 */

const fs = require('fs')
const path = require('path')
const execSync = require('child_process').execSync

const { version, homepage } = require('./package.json')

// Define some constants
const input = path.join(__dirname, './dist/worker.js')
const output = path.join(__dirname, `./dist/worker_${version}.js`)
const command = 'wrangler --version'

// Prepare the content to be written
let wranglerVersion
try {
  const stdout = execSync(command)
  wranglerVersion = /wrangler ([\d\.]+)\s*/.exec(stdout)[1]
} catch {
  wranglerVersion = 'unknown version'
}

// Generate the final comments
const comments = `// ${homepage}
// version: ${version}
// build: ${formatLocaleString(Date.now())} GMT${getTimezoneOffset()}
// wrangler: ${wranglerVersion}
`

// Write to new file
const originalContent = fs.readFileSync(input, 'utf8')
fs.writeFileSync(output, comments + '\n' + originalContent, 'utf8')

/**
 * Copied from './src/utils/helper.js'
 * since that function is not exported with `module.exports`
 */
function formatLocaleString(time) {
  const localeStr = new Date(time).toLocaleString('default', {
    formatMatcher: 'best fit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })
  let str = new Date(localeStr + ' UTC').toISOString()
  return str.substring(0, 19).replace('T', ' ')
}

// https://stackoverflow.com/questions/24500375/#24500441
function getTimezoneOffset() {
  const z = n => (n < 10 ? '0' : '') + n
  let offset = new Date().getTimezoneOffset()
  const sign = offset < 0 ? '+' : '-'
  offset = Math.abs(offset)
  return sign + z((offset / 60) | 0) + z(offset % 60)
}
