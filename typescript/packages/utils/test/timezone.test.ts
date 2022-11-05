import { describe, expect, test } from 'vitest'
import timezone_mock from 'timezone-mock'

import { getTimezoneOffset, formatLocaleString as fmt } from '../src/timezone'

const timeZoneName = {
  UTC: 'UTC',
  CST: 'Asia/Shanghai',
  LA: 'America/Los_Angeles',
} as const

describe('getTimezoneOffset()', () => {
  test('mock timezone and then test', () => {
    // The Etc/GMT offsets work in the opposite direction,
    // e.g. `Etc/GMT-8` is equivalent to `GMT+8 / UTC+8`.
    // ref: https://github.com/Jimbly/timezone-mock/issues/62
    timezone_mock.register('Etc/GMT-8')
    expect(getTimezoneOffset()).toBe('+0800')

    timezone_mock.register('Etc/GMT+7')
    expect(getTimezoneOffset()).toBe('-0700')

    // Remember to unregister the mock
    timezone_mock.unregister()
  })
})

describe('formatLocaleString()', () => {
  const timeStamp = 1584994553000
  const timeStr = {
    UTC: 'Mon, 23 Mar 2020 20:15:53 GMT',
    CST: '2020/03/24 04:15:53',
    LA: '3/23/2020, 1:15:53 PM',
  } as const
  const wanted = {
    UTC: '2020-03-23 20:15:53',
    CST: '2020-03-24 04:15:53',
    LA: '2020-03-23 13:15:53',
  } as const

  test('format time string', () => {
    // timeString without "GMT" identifier will be formatted directly, without the time-zone conversion
    expect(fmt(timeStr.CST)).toBe(wanted.CST)
    expect(fmt(timeStr.LA)).toBe(wanted.LA)

    // timeString with the "GMT" identifier will be time-zone converted before being formatted
    expect(fmt(timeStr.UTC, timeZoneName.LA)).toBe(wanted.LA)
    expect(fmt(timeStr.CST + ' GMT+8', timeZoneName.LA)).toBe(wanted.LA)
    expect(fmt(timeStr.LA + ' GMT-7', timeZoneName.UTC)).toBe(wanted.UTC)
  })

  test('format timestamp', () => {
    // If no time zone is specified, timeStamp will be converted to local time and then formatted
    // expect(fmt(timeStamp)).toBe(wanted.CST)

    // Otherwise it will be converted to the time in that specified time-zone and then formatted
    expect(fmt(timeStamp, timeZoneName.UTC)).toBe(wanted.UTC)
    expect(fmt(timeStamp, timeZoneName.CST)).toBe(wanted.CST)
    expect(fmt(timeStamp, timeZoneName.LA)).toBe(wanted.LA)
  })

  test('convert Date object', () => {
    const date = new Date(timeStamp)
    // All tests on Date object should be the same as those for timestamp
    expect(fmt(date, timeZoneName.UTC)).toBe(wanted.UTC)
    expect(fmt(date, timeZoneName.CST)).toBe(wanted.CST)
    expect(fmt(date, timeZoneName.LA)).toBe(wanted.LA)
  })
})
