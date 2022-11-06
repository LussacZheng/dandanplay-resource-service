export { default as extract } from './extractor.js'
export * from './timezone.js'

/**
 * Replace placeholders in `templateStr` according to the content of `payload`.
 *
 * @param templateStr
 * Use `${KEY}` as placeholder, use `\${KEY}` if in `template literals`.
 *   - `KEY` should match the regular expression `[\w-]+`
 *   - `KEY` is case-sensitive, `KEY` != `key`
 * @param payload
 * Corresponding to `templateStr`, pass `{ KEY: 'VALUE', KEY2: 'VALUE2' }`.
 *
 * @example
 * const str = 'python.org/${str1}/${str2}/python-${str2}.exe'
 * const payload = { str1: 'ftp/python', str2: '3.8.2' }
 * let result = template(str, payload)
 * result === 'python.org/ftp/python/3.8.2/python-3.8.2.exe'
 */
export function template(templateStr: string, payload: Record<string, string | number>): string {
  return templateStr.replace(/\$\{([\w-]+)\}/g, (match, key) => {
    // If `key' from `templateStr' does not exist in `payload', leave it as-is
    return `${payload[key] ?? match}`
  })
}
