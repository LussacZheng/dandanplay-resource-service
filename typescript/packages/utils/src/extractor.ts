type one = 'first' | 'last'
type all = 'all'
type which = one | all

/**
 * Extract target sub-string from `text` by a regular expression.
 *
 * @param text Content text.
 * @param regex A regular expression like `/pattern/gim`.
 * @param receivers Add an element for every captured strings(parenthesized substring).
 *   If `receivers` is empty, directly returns the first captured value.
 * @param whichMatch Default to `'first'`.
 *
 * @example
 * const text = 'The Latest Python 3 Release - Python 3.8.2 on Feb. 24, 2020'
 * const regex = /Latest (Python 3) Release - Python ([\d\.]+)/gim
 * let info = parser(text, regex, ['name', 'version'])
 * info === { name: 'Python 3', version: '3.8.2' }
 *
 * @return
 * - returns `null` if nothing matched;
 * - returns `string` if `receivers` is empty `[]`, otherwise returns `Record<receivers, string>`;
 * - returns a single above type (`string | Record<receivers, string>`) if `whichMatch != 'all'`,
 *           otherwise returns an array of that (`string[] | Record<receivers, string>[]`).
 */
function extract(text: string, regex: RegExp, receivers?: [], whichMatch?: one): string | null
function extract(text: string, regex: RegExp, receivers: [], whichMatch: all): string[] | null
function extract<T extends string>(
  text: string,
  regex: RegExp,
  receivers: T[],
  whichMatch?: one,
): Record<T, string> | null
function extract<T extends string>(
  text: string,
  regex: RegExp,
  receivers: T[],
  whichMatch: all,
): Record<T, string>[] | null
function extract<T extends string>(
  text: string,
  regex: RegExp,
  receivers?: T[],
  whichMatch: which = 'first',
): string | Record<T, string> | string[] | Record<T, string>[] | null {
  switch (whichMatch) {
    case 'all':
      return getAllMatch(text, regex, receivers)
    case 'last':
      return getLastMatch(text, regex, receivers)
    default:
      return getFirstMatch(text, regex, receivers)
  }
  // don't forget to `break` in `switch-case` if returns here
}

function getFirstMatch<T extends string>(
  text: string,
  regex: RegExp,
  receivers?: T[],
): string | Record<T, string> | null {
  const result = regex.exec(text)

  // JavaScript RegExp objects are stateful when they have the global or
  // sticky flags set (e.g. /foo/g or /foo/y).
  // They store a lastIndex from the previous match.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
  regex.lastIndex = 0

  return result === null ? null : load(result, receivers)
}

function getLastMatch<T extends string>(
  text: string,
  regex: RegExp,
  receivers?: T[],
): string | Record<T, string> | null {
  const results = [...text.matchAll(regex)]
  const lastResult = results[results.length - 1]
  return results.length === 0 ? null : load(lastResult, receivers)
}

function getAllMatch<T extends string>(
  text: string,
  regex: RegExp,
  receivers?: T[],
): string[] | Record<T, string>[] | null {
  const iterator = text.matchAll(regex)
  const arr = Array.from(iterator, i => load(i, receivers))
  return arr.length === 0 ? null : arr
}

/**
 * Load the receivers with the result array from {@link String.match} or {@link RegExp.exec}
 */
// function load(result: RegExpExecArray | RegExpMatchArray): string
// function load(result: RegExpExecArray | RegExpMatchArray, receivers: undefined): string
function load(result: RegExpExecArray | RegExpMatchArray, receivers: []): string
function load<T extends string>(
  result: RegExpExecArray | RegExpMatchArray,
  receivers?: T[],
): Record<T, string>
function load<T extends string>(
  result: RegExpExecArray | RegExpMatchArray,
  receivers?: T[],
): string | Record<T, string> {
  // If `receivers` is undefined or empty, directly returns the first captured value.
  if (!receivers || !receivers.length) {
    return result[1]
  }

  const info = {} as Record<T, string>

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

export default extract
