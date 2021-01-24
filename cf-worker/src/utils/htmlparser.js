'use strict'

/**
 * @param {String} html HTML text string
 * @param {RegExp} regex `/pattern/gim`
 * @param {Array<string>} receivers
 * Add an element for every captured strings(parenthesized substring).
 *   If `receivers` is empty, directly returns the first captured value.
 * @param {'first' | 'last' | 'all'} whichMatch 'first' default
 * @example
 * const html = 'The Latest Python 3 Release - Python 3.8.2 on Feb. 24, 2020'
 * const regex = /Latest (Python 3) Release - Python ([\d\.]+)/gim
 * let info = htmlparser(html, regex, ['name', 'version'])
 * info === { name: 'Python 3', version: '3.8.2' }
 * @return {String | Object<string, string> | Array<Object<string, string>> | null}
 * - returns `null` if nothing matched;
 * - returns `String` if `receivers` is empty `[]`;
 * - returns `Object<string, string>` if `whichMatch` != 'all';
 * - returns `Array<Object<string, string>>` if `whichMatch` == 'all'.
 */
function htmlparser(html, regex, receivers, whichMatch = 'first') {
  switch (whichMatch) {
    case 'all':
      return getAllMatch(html, regex, receivers)
    case 'last':
      return getLastMatch(html, regex, receivers)
    default:
      return getFirstMatch(html, regex, receivers)
  }
  // don't forget to `break` in `switch-case` if returns here
}

/**
 * @param {String} html HTML text string
 * @param {RegExp} regex `/pattern/gim`
 * @param {Array<string>} receivers
 * @return {Object<string, string>}
 */
function getFirstMatch(html, regex, receivers) {
  let result = regex.exec(html)

  // JavaScript RegExp objects are stateful when they have the global or
  // sticky flags set (e.g. /foo/g or /foo/y).
  // They store a lastIndex from the previous match.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  regex.lastIndex = 0

  return result === null ? null : load(result, receivers)
}

/**
 * @param {String} html HTML text string
 * @param {RegExp} regex `/pattern/gim`
 * @param {Array<string>} receivers
 * @return {Object<string, string>}
 */
function getLastMatch(html, regex, receivers) {
  const results = [...html.matchAll(regex)]
  const lastResult = results[results.length - 1]
  return results.length === 0 ? null : load(lastResult, receivers)
}

/**
 * @param {String} html HTML text string
 * @param {RegExp} regex `/pattern/gim`
 * @param {Array<string>} receivers
 * @return {Array<Object<string, string>>}
 */
function getAllMatch(html, regex, receivers) {
  const iterator = html.matchAll(regex)
  const arr = Array.from(iterator, i => load(i, receivers))
  return arr.length === 0 ? null : arr
}

/**
 * Load the receivers with the result array from `String.prototype.match()`
 * @param {Array} results
 * @param {Array} receivers
 * @return {Object<string, string>}
 */
function load(result, receivers) {
  // If `receivers` is empty, directly returns the first captured value.
  if (receivers.length === 0) {
    return result[1]
  }

  let info = {}

  // result[0] is the full string of characters matched.
  // Under normal conditions, receivers.length === result.length - 1
  // If you provide less receivers, you can't receive the last few captured strings.
  // If you provide too much receivers, only keep the the first few captured strings.
  if (receivers.length > result.length - 1) {
    receivers.splice(result.length - 1)
  }

  receivers.forEach((element, index) => {
    info[element] = result[index + 1]
  })
  return info
}

export default htmlparser
