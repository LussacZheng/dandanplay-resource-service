interface SupportedOptions {
  realtime: number
  page: number
  limit: number
}
type UnprocessedOptions = Record<string, number>
type UnprocessedSearchOptions = {
  keyword: string
  options: UnprocessedOptions
}

/**
 * @example
 * str1 = 'fate stay night'
 * str2 = 'fate stay night $realtime'
 * str3 = 'fate stay night $realtime:3'
 * let objX = new SearchOptions(strX)
 * objX.keyword === 'fate stay night'
 * obj1.options.realtime === 0
 * obj2.options.realtime === 1
 * obj3.options.realtime === 3
 */
export default class SearchOptions {
  keyword: string
  options: SupportedOptions

  constructor(searchStr: string) {
    // It is a filter or formatter for `parseSearchOperator()`
    const { keyword, options } = parseSearchOperator(searchStr)
    this.keyword = keyword
    this.options = {
      realtime: options.realtime || _DEFAULT.UNUSED.realtime,
      page: options.page || _DEFAULT.UNUSED.page,
      limit: options.limit || _DEFAULT.UNUSED.limit,
    }
    // this.options.sort = options.sort || _DEFAULT.UNUSED.sort
  }
}

/**
 * Define the default value of each options
 */
const _DEFAULT: { UNUSED: SupportedOptions; UNASSIGNED: UnprocessedOptions; UNDEFINED: number } = {
  UNUSED: {
    realtime: 0,
    page: 1,
    limit: 200,
    // sort: 0,
  },
  UNASSIGNED: {
    realtime: 1,
    page: 1,
    limit: 80,
    // sort: 1,
  },
  UNDEFINED: 1,
} as const

/**
 * Parse and extract the search operators in search string.
 *
 * @example
 * const str = '$page:3  fate stay $realtime $reverse $limit:50 night'
 * let { keyword, options } = parseSearchOperator(str)
 * keyword === '  fate stay night'
 * options === { page: 3, realtime: 1, reverse: 1, limit: 50 }
 */
export function parseSearchOperator(searchStr: string): UnprocessedSearchOptions {
  const options: UnprocessedOptions = {}
  const keyword = searchStr.replace(
    /(?: |^)\$([a-z]+)(?::(\d+))?(?=\s|$)/g,
    (_match, optionName: string, optionValue: string) => {
      const value = parseInt(optionValue)
      // $realtime => value will be `NaN`, so assign it with `UNASSIGNED[realtime]` => 1
      // $reverse => value will be `NaN`, so assign it with `UNASSIGNED[reverse]`
      // but `UNASSIGNED[reverse]` is `undefined`, so assign it with the DefaultValue of Undefined
      options[optionName] = isNaN(value)
        ? _DEFAULT.UNASSIGNED[optionName] || _DEFAULT.UNDEFINED
        : value
      return ''
    },
  )
  return {
    keyword: keyword.replace(/\$\$/g, '$'),
    options,
  }
}
