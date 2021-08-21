'use strict'

/**
 * Copied from './src/utils/helper.js'
 * since those functions is not exported with `module.exports`
 */

function template(templateStr, payload) {
  return templateStr.replace(/\$\{(\w+)\}/gi, (match, key) => {
    return payload[key]
  })
}

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

module.exports = {
  template,
  formatLocaleString,
  getTimezoneOffset,
}
