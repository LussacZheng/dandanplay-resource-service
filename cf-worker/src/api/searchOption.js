/**
 * @class
 * @example
 * str1 = 'fate stay night'
 * str2 = 'fate stay night $realtime'
 * str3 = 'fate stay night $realtime:3'
 * let objX = new SearchOptions(strX)
 * objX.keyword === 'fate stay night'
 * obj1.realtime === 0; obj2.realtime === 1; obj3.realtime === 3
 */
export default class SearchOptions {
  /**
   * @param {String} searchStr
   */
  constructor(searchStr) {
    const { keyword, options } = parseSearchOperator(searchStr)
    this.keyword = keyword
    this.realtime = options.realtime || 0
  }
}

/**
 * Parse and extract the search operators in search string
 * @param {String} searchStr
 * @example
 * const str = '$page:3  fate stay $realtime:2 $reverse $limit:50 night'
 * let { keyword, options } = parseSearchOperator(str)
 * keyword === '  fate stay night'
 * options === { page: 3, realtime: 2, reverse: 1, limit: 50 }
 * @returns {Object}
 */
function parseSearchOperator(searchStr) {
  let options = {}
  const keyword = searchStr.replace(/ ?\$(\w+)(:(\d+))?/gi, (match, optionName, _, optionValue) => {
    options[optionName] = parseInt(optionValue) || 1
    return ''
  })
  return {
    keyword,
    options,
  }
}
