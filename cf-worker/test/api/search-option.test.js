import SearchOptions, { parseSearchOperator } from '@/api/search-option'

const plainStr = ' fate stay night '

/**
 * No given options
 */
test('No given options', () => {
  const { keyword, options } = parseSearchOperator(plainStr)
  expect(keyword).toBe(plainStr)
  expect(options).toEqual({})

  const obj = new SearchOptions(plainStr)
  expect(obj.keyword).toBe(plainStr)
  expect(obj.options).toStrictEqual({
    realtime: 0,
    page: 1,
    limit: 200,
  })
})

/**
 * Zero-value testing
 */
test('Zero-value', () => {
  let str = ' fate stay $realtime:0 $page:0 $limit:0 night '

  let obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({
    realtime: 0,
    page: 0,
    limit: 0,
  })
  let obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 0,
    page: 1,
    limit: 200,
  })
})

/**
 * Item-by-item testing
 */
// $realtime
test('Item-by-item: $realtime', () => {
  let str = ' fate stay $realtime night '

  let obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ realtime: 1 })
  let obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 1,
    page: 1,
    limit: 200,
  })

  str = ' fate stay $realtime:2 night '

  obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ realtime: 2 })
  obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 2,
    page: 1,
    limit: 200,
  })
})

// $page
test('Item-by-item: $page', () => {
  let str = ' fate stay $page night '

  let obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ page: 1 })
  let obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 0,
    page: 1,
    limit: 200,
  })

  str = ' fate stay $page:3 night '

  obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ page: 3 })
  obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 0,
    page: 3,
    limit: 200,
  })
})

// $limit
test('Item-by-item: $limit', () => {
  let str = ' fate stay $limit night '

  let obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ limit: 80 })
  let obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 0,
    page: 1,
    limit: 80,
  })

  str = ' fate stay $limit:50 night '

  obj1 = parseSearchOperator(str)
  expect(obj1.keyword).toBe(plainStr)
  expect(obj1.options).toEqual({ limit: 50 })
  obj2 = new SearchOptions(str)
  expect(obj2.keyword).toBe(plainStr)
  expect(obj2.options).toStrictEqual({
    realtime: 0,
    page: 1,
    limit: 50,
  })
})

/**
 * Parse complex string
 */
const complexStr =
  '$page:3  fate stay $realtime $realtime:-1 $realtime:1.5 $reverse  $limit:500 $limIt:20 $n$ig$$ht$ $$abc $$efg:2 $ $中文指令 $sorted $limit $page:005'

const WANTED = {
  keyword: '  fate stay $realtime:-1 $realtime:1.5  $limIt:20 $n$ig$ht$ $abc $efg:2 $ $中文指令',
  options: {
    page: 5,
    realtime: 1,
    reverse: 1,
    limit: 80,
    sorted: 1,
  },
  properties: {
    realtime: 1,
    page: 5,
    limit: 80,
    // sort: 0,
  },
}

const { keyword, options } = parseSearchOperator(complexStr)

test('Complex String: keyword Extraction', () => {
  expect(keyword).toBe(WANTED.keyword)
})

test('Complex String: Options Extraction', () => {
  expect(options).toEqual(WANTED.options)
})

test('Complex String: SearchOptions constructor', () => {
  const obj = new SearchOptions(complexStr)
  expect(obj.keyword).toBe(WANTED.keyword)
  expect(obj.options).toStrictEqual(WANTED.properties)
})
