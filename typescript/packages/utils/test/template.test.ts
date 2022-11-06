import { describe, expect, test } from 'vitest'

import { template } from '../src/index'

describe('template()', () => {
  test('basic', () => {
    const str = 'python.org/${str1}/${str2}/python-${str2}.exe'
    const payload = { str1: 'ftp/python', str2: '3.8.2' }
    expect(template(str, payload)).toBe('python.org/ftp/python/3.8.2/python-3.8.2.exe')
  })

  test('escape', () => {
    const variable = 'python'
    const str = `${variable}.org/\${str1}/\${str2}/${variable}-\${str2}.exe`
    const payload = { str1: 'ftp/python', str2: '3.8.2' }
    expect(template(str, payload)).toBe('python.org/ftp/python/3.8.2/python-3.8.2.exe')
  })

  test('possible keys', () => {
    // - `KEY` should match the regular expression `[\w-]+`, or `[A-Za-z0-9_-]+`
    // - `KEY` is case-sensitive, `KEY` != `key`
    const str = 'python.${0}/${sTr}/${StR}${_}${-}/python-${StR}${_}${-}.${1_sTr4ngE_keY-_-Here-}'
    const payload = {
      0: 'org',
      sTr: 'ftp/python',
      StR: '3',
      _: '.8.',
      '-': 2,
      '1_sTr4ngE_keY-_-Here-': 'exe',
    }
    expect(template(str, payload)).toBe('python.org/ftp/python/3.8.2/python-3.8.2.exe')
  })

  test('mismatched keys', () => {
    let str = '',
      payload = {}

    // too many keys in payload
    str = 'python.org/${str1}/${str2}/python-${str2}.exe'
    payload = { str1: 'ftp/python', str2: '3.8.2', str3: 'abc' }
    expect(template(str, payload)).toBe('python.org/ftp/python/3.8.2/python-3.8.2.exe')

    // too few keys in payload
    str = 'python.org/${str1}/${str2}/python-${str2}.exe'
    payload = { str2: '3.8.2' }
    expect(template(str, payload)).toBe('python.org/${str1}/3.8.2/python-3.8.2.exe')

    // mismatched keys
    str = 'python.org/${str1}/${str2}${num}/python-${str2}${num}.exe, ${str3}'
    payload = { str1: 'ftp/python', str2: '3.8.', num: 2, str4: 'abc' }
    expect(template(str, payload)).toBe('python.org/ftp/python/3.8.2/python-3.8.2.exe, ${str3}')
  })

  test('empty str or payload', () => {
    // empty str
    const payload = { str1: 'ftp/python', str2: '3.8.2' }
    expect(template('', payload)).toBe('')

    // empty payload
    const str = 'python.org/${str1}/${str2}/python-${str2}.exe'
    expect(template(str, {})).toBe(str)
  })

  test('falsy value', () => {
    const str = 'python.org/${str1}/${str2}${num}/python-${str2}${num}.exe, ${num2}'

    const payload1 = { str1: 'ftp/python', str2: '3.8.', num: 0 }
    expect(template(str, payload1)).toBe('python.org/ftp/python/3.8.0/python-3.8.0.exe, ${num2}')

    const payload2 = { str1: '', str2: ' ', num: 0, num2: NaN }
    expect(template(str, payload2)).toBe('python.org// 0/python- 0.exe, NaN')
  })
})
