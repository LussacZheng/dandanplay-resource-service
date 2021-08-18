import { template, formatLocaleString as fmt } from '@/utils/helper.js'

test('template()', () => {
  const templateStr = 'python.org/${str1}/${str2}/python-${str2}.exe, ${str3}'
  const payload = { str1: 'ftp/python', str2: '3.8.2', str4: 'abc' }
  expect(template(templateStr, payload)).toBe(
    'python.org/ftp/python/3.8.2/python-3.8.2.exe, undefined',
  )
})

test('formatLocaleString()', () => {
  const timeZoneName = {
    UTC: 'UTC',
    CST: 'Asia/Shanghai',
    LA: 'America/Los_Angeles',
  }
  const timeStamp = 1584994553000
  const timeStr = {
    UTC: 'Mon, 23 Mar 2020 20:15:53 GMT',
    CST: '2020/03/24 04:15:53',
    LA: '3/23/2020, 1:15:53 PM',
  }
  const wanted = {
    UTC: '2020-03-23 20:15:53',
    CST: '2020-03-24 04:15:53',
    LA: '2020-03-23 13:15:53',
  }

  // timeString without "GMT" identifier will be formatted directly, without the time-zone conversion
  expect(fmt(timeStr.CST)).toBe(wanted.CST)
  expect(fmt(timeStr.LA)).toBe(wanted.LA)

  // timeString with the "GMT" identifier will be time-zone converted before being formatted
  expect(fmt(timeStr.UTC, timeZoneName.LA)).toBe(wanted.LA)
  expect(fmt(timeStr.CST + ' GMT+8', timeZoneName.LA)).toBe(wanted.LA)
  expect(fmt(timeStr.LA + ' GMT-7', timeZoneName.UTC)).toBe(wanted.UTC)

  // If no time zone is specified, timeStamp will be converted to local time and then formatted
  expect(fmt(timeStamp)).toBe(wanted.CST)
  // Otherwise it will be converted to the time in that specified time-zone and then formatted
  expect(fmt(timeStamp, timeZoneName.UTC)).toBe(wanted.UTC)
  expect(fmt(timeStamp, timeZoneName.CST)).toBe(wanted.CST)
  expect(fmt(timeStamp, timeZoneName.LA)).toBe(wanted.LA)
})
