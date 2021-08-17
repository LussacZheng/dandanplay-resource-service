import SearchOptions, { parseSearchOperator } from '../../src/api/search-option'

const str =
  '$page:3  fate stay $realtime $realtime:-1 $realtime:1.5 $reverse  $limit:50 $n$ig$$ht$ $$abc $$efg:2 $中文指令 $sorted $limit $page:5'

const { keyword, options } = parseSearchOperator(str)
const obj = new SearchOptions(str)

const WANTED = {
  keyword: '  fate stay $realtime:-1 $realtime:1.5  $n$ig$ht$ $abc $efg:2 $中文指令',
  options: {
    page: 5,
    realtime: 1,
    reverse: 1,
    // limit: 80,
    limit: 1,
    sorted: 1,
  },
  properties: {
    realtime: 1,
    // page: 5,
    // limit: 80,
    // sort: 0,
  },
}

test('keyword Extraction', () => {
  expect(keyword).toBe(WANTED.keyword)
})

test('Options Extraction', () => {
  expect(options).toEqual(WANTED.options)
})

test('SearchOptions constructor', () => {
  expect(obj.keyword).toBe(WANTED.keyword)
  expect(obj.options).toStrictEqual(WANTED.properties)
})
