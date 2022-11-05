/**
 * Get the formatted string at a certain moment.
 *
 * @param time A TimeStamp or regular TimeString
 * @param timeZone Specify a time-zone instead of using the local time-zone.
 *
 * @example
 * formatLocaleString(1584994553000) === '2020-03-24 04:15:53'
 * formatLocaleString('04:15 3/24/2020') === '2020-03-24 04:15:00'
 * formatLocaleString(1584994553000, 'America/Los_Angeles') === '2020-03-23 13:15:53'
 * // or
 * console.log(formatLocaleString(Date.now()))
 *
 * @link
 * MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
 * IANA time zone database: https://www.iana.org/time-zones
 */
export function formatLocaleString(time: number | string | Date, timeZone?: string) {
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
    timeZone: timeZone,
  })
  // now localeStr == '2020/03/24 04:15:53'
  //   If there is no params for `toLocaleString()`,
  //   localeStr will be '2020/3/24 上午4:15:53'

  // Since ISO string is alway formatted, like: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  // To get ISO string, we assume the locale time is just the UTC time.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#non-standard_date_strings
  const str = new Date(localeStr + ' GMT').toISOString()
  // now str == '2020-03-24T04:15:53.000Z'

  return str.substring(0, 19).replace('T', ' ')
}

/**
 * Get GMT timezone offset, such as '+0800'.
 *
 * @link https://stackoverflow.com/a/24500441
 */
export function getTimezoneOffset(): string {
  const z = (n: number) => (n < 10 ? '0' : '') + n
  let offset = new Date().getTimezoneOffset()
  const sign = offset < 0 ? '+' : '-'
  offset = Math.abs(offset)
  return sign + z((offset / 60) | 0) + z(offset % 60)
}
