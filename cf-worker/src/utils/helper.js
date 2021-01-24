'use strict'

/**
 * @param {String} templateStr
 * Use `${KEY}` as placeholder, use `\${KEY}` if in `template literals`
 * @param {Object<string,string>} payload
 * Corresponding to `templateStr`, pass `{ KEY: 'VALUE' }`
 * @example
 * const templateStr = 'python.org/${str1}/${str2}/python-${str2}.exe'
 * const payload = { str1: 'ftp/python', str2: '3.8.2' }
 * let result = template(templateStr, payload)
 * result === 'python.org/ftp/python/3.8.2/python-3.8.2.exe'
 * @return {String}
 */
export function template(templateStr, payload) {
  let computed = templateStr.replace(/\$\{(\w+)\}/gi, (match, key) => {
    return payload[key]
  })
  return computed
}

/**
 * @param {Number | String} time a TimeStamp or regular TimeString
 * @example
 * formatLocaleString(1584994553000) === '2020-03-24 04:15:53'
 * formatLocaleString('04:15 3/24/2020') === '2020-03-24 04:15:00'
 * // or
 * console.log(formatLocaleString(Date.now()))
 */
export function formatLocaleString(time) {
  // If I am at the timezone of 'Asia/Shanghai',
  // let the locale time is '2020/03/24 04:15:53'.
  // and the `timeStamp` is '1584994553000'
  // So UTC time '2020-03-23T20:15:53Z' now

  const localeStr = new Date(time).toLocaleString('default', {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
    formatMatcher: 'best fit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    // hour12: false,
    // https://github.com/moment/luxon/issues/675
    hourCycle: 'h23',
  })
  // now localeStr == '2020/03/24 04:15:53'
  //   If there is no params for `toLocaleString()`,
  //   localeStr will be '2020/3/24 上午4:15:53'

  // Since ISO string is alway formatted, like: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  // To get ISO string, we assume the locale time is just the UTC time.
  let str = new Date(localeStr + ' UTC').toISOString().substr(0, 19)
  // now str == '2020-03-24T04:15:53'

  return str.replace('T', ' ')
}
