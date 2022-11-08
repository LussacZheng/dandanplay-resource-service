// https://github.com/LussacZheng/dandanplay-resource-service
// version: 0.0.5-alpha
// build: 2022-11-08 21:18:25 GMT+0800
// deno: 1.27.1

import { serve } from 'https://deno.land/std@0.161.0/http/server.ts'
import { router } from 'https://deno.land/x/rutt@0.0.13/mod.ts'

const __default = {
  name: 'dandanplay-resource-service',
  version: '0.0.5-alpha',
  homepage: 'https://github.com/LussacZheng/dandanplay-resource-service',
}
const ResInitJson = {
  headers: {
    'content-type': 'application/json;charset=utf-8',
  },
}
const ResInitHtml = {
  headers: {
    'content-type': 'text/html;charset=utf-8',
  },
}
const ReqInitHtml = {
  headers: {
    accept: 'text/html;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
}
async function get(url, init = ReqInitHtml) {
  const res = await fetch(decodeURI(url), init)
  if (!res.ok) {
    throw new Error(`Bad response from server: ${res.status}`)
  }
  return await gatherResponse(res)
}
async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return await response.json()
  } else if (contentType?.includes('application/text')) {
    return await response.text()
  } else if (contentType?.includes('text/html')) {
    return await response.text()
  } else {
    return await response.text()
  }
}
class SearchOptions {
  constructor(searchStr) {
    const { keyword, options } = parseSearchOperator(searchStr)
    this.keyword = keyword
    this.options = {
      realtime: options.realtime || _DEFAULT.UNUSED.realtime,
      page: options.page || _DEFAULT.UNUSED.page,
      limit: options.limit || _DEFAULT.UNUSED.limit,
    }
  }
}
const _DEFAULT = {
  UNUSED: {
    realtime: 0,
    page: 1,
    limit: 200,
  },
  UNASSIGNED: {
    realtime: 1,
    page: 1,
    limit: 80,
  },
  UNDEFINED: 1,
}
function parseSearchOperator(searchStr) {
  const options = {}
  const keyword = searchStr.replace(
    /(?: |^)\$([a-z]+)(?::(\d+))?(?=\s|$)/g,
    (_match, optionName, optionValue) => {
      const value = parseInt(optionValue)
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
function extract(text, regex, receivers, whichMatch = 'first') {
  switch (whichMatch) {
    case 'all':
      return getAllMatch(text, regex, receivers)
    case 'last':
      return getLastMatch(text, regex, receivers)
    default:
      return getFirstMatch(text, regex, receivers)
  }
}
function getFirstMatch(text, regex, receivers) {
  const result = regex.exec(text)
  regex.lastIndex = 0
  return result === null ? null : load(result, receivers)
}
function getLastMatch(text, regex, receivers) {
  const results = [...text.matchAll(regex)]
  const lastResult = results[results.length - 1]
  return results.length === 0 ? null : load(lastResult, receivers)
}
function getAllMatch(text, regex, receivers) {
  const iterator = text.matchAll(regex)
  const arr = Array.from(iterator, (i) => load(i, receivers))
  return arr.length === 0 ? null : arr
}
function load(result, receivers) {
  if (!receivers || !receivers.length) {
    return result[1]
  }
  const info = {}
  if (receivers.length > result.length - 1) {
    receivers.splice(result.length - 1)
  }
  receivers.forEach((element, index) => {
    info[element] = result[index + 1]
  })
  return info
}
function formatLocaleString(time, timeZone) {
  const localeStr = new Date(time).toLocaleString('default', {
    formatMatcher: 'best fit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: timeZone,
  })
  const str = new Date(localeStr + ' GMT').toISOString()
  return str.substring(0, 19).replace('T', ' ')
}
function template(templateStr, payload) {
  return templateStr.replace(/\$\{([\w-]+)\}/g, (match, key) => {
    return `${payload[key] ?? match}`
  })
}
const BASE = 'https://share.dmhy.org'
const DMHY = {
  type_and_subgroup_url: `${BASE}/topics/advanced-search?team_id=0&sort_id=0&orderby=`,
  list_url: `${BASE}/topics/list/page/\${page}?keyword=\${keyword}&sort_id=\${type}&team_id=\${subgroup}&order=date-desc`,
  index_url: `${BASE}/topics/list/page/\${realtime}`,
}
const UNKNOWN = {
  Title: '未能成功解析标题',
  TypeId: -2,
  TypeName: '未能成功解析类别',
  SubgroupId: -1,
  SubgroupName: '未知字幕组',
  Magnet: 'magnet_not_found_未能成功解析磁力链接或磁力链接不存在',
  PageUrl: '未能成功解析资源发布页面',
  FileSize: '未能成功解析资源大小',
  PublishDate: '1970-01-01 08:00:00',
}
const REGEX = {
  Subgroups: /<option value="(\d+)">(.+?)<\/option>/gim,
  Types: /<option value="(\d+)" style="color: [\w#]+">(.+?)<\/option>/gim,
  List: {
    HasMore: /下一頁/g,
    Resources: /<tr class="">(.*?)<\/tr>/gis,
    TypeId: /href="\/topics\/list\/sort_id\/(\d+)"/gim,
    TypeName: /<font color=[\w#]+>(.+)<\/font>/gim,
    SubgroupId: /href="\/topics\/list\/team_id\/(\d+)"/gim,
    SubgroupName: /\s+(.*)<\/a><\/span>/gim,
    Magnet: /href="(magnet:\?xt=urn:btih:.+?)"/gim,
    PageUrl: /href="(.+?)"\s*target="_blank"/gim,
    FileSize: /<td.*>([\w\.]+B)<\/td>/gim,
    PublishDate: /<span style="display: none;">([\d\/ :]+)<\/span>/gim,
    Title: /target="_blank" ?>(.+?)<\/a>/gis,
    TitleReplacer: /<span class="keyword">(.*?)<\/span>/gi,
  },
}
async function generateSubgroup() {
  const html = await get(DMHY.type_and_subgroup_url)
  return {
    Subgroups: extractSubgroups(html),
  }
}
async function generateType() {
  const html = await get(DMHY.type_and_subgroup_url)
  return {
    Types: extractTypes(html),
  }
}
async function generateList(requestUrl) {
  const params = new URL(encodeURI(requestUrl)).searchParams
  let type = Number(params.get('type')) || 0
  let subgroup = Number(params.get('subgroup')) || 0
  type = type < 0 ? 0 : type
  subgroup = subgroup < 0 ? 0 : subgroup
  const { keyword, options } = new SearchOptions(decodeURIComponent(params.get('keyword') || ''))
  const fetchURL = encodeURI(
    template(DMHY.list_url, {
      page: options.page,
      keyword,
      type,
      subgroup,
    }),
  )
  let html = await get(fetchURL)
  const result = extractList(html)
  if (options.realtime) {
    const fetchURL_realtime = encodeURI(
      template(DMHY.index_url, {
        realtime: options.realtime,
      }),
    )
    html = await get(fetchURL_realtime)
    const extraResources = extraResourcesForOptionRealtime(
      html,
      keyword,
      subgroup,
      type,
      result.Resources,
    )
    result.Resources = extraResources.concat(result.Resources)
  }
  if (result.Resources.length > options.limit) {
    result.Resources = result.Resources.slice(0, options.limit)
  }
  return result
}
function extractSubgroups(html) {
  const decodedHtml = html.replace(/&amp;/gi, '&')
  const rawSubgroups = extract(decodedHtml, REGEX.Subgroups, ['Id', 'Name'], 'all')
  if (rawSubgroups === null) return []
  const subgroups = rawSubgroups.map((item) => convertItem(item))
  subgroups.shift()
  return subgroups
}
function extractTypes(html) {
  const rawTypes = extract(html, REGEX.Types, ['Id', 'Name'], 'all')
  if (rawTypes === null) return []
  const types = rawTypes.map((item) => convertItem(item))
  types.unshift({
    Id: 0,
    Name: '全部',
  })
  return types
}
function extractList(html) {
  const result = {
    HasMore: extract(html, REGEX.List.HasMore, []) !== null,
    Resources: [],
  }
  const elements = extract(html, REGEX.List.Resources, [], 'all')
  if (elements === null) return result
  elements.forEach((e) => {
    result.Resources.push(extractListFromElement(e))
  })
  return result
}
function convertItem(raw) {
  return {
    Id: parseInt(raw.Id),
    Name: raw.Name,
  }
}
function extraResourcesForOptionRealtime(html, keyword, subgroup, type, originalRes) {
  const resources = []
  const elements = extract(html, REGEX.List.Resources, [], 'all')
  if (elements === null) return []
  elements.forEach((e) => {
    const res = extractListFromElement(e)
    const isKeywordMatched = keyword.split(' ').every((word) => {
      return res.Title.toLowerCase().includes(word.toLowerCase())
    })
    const isSubgroupMatched = subgroup === 0 ? true : res.SubgroupId === subgroup
    const isTypeMatched = type === 0 ? true : res.TypeId === type
    const isDuplicated = originalRes.some((item) => res.PageUrl === item.PageUrl)
    if (isKeywordMatched && isSubgroupMatched && isTypeMatched && !isDuplicated) {
      resources.push(res)
    }
  })
  return resources
}
function extractListFromElement(element) {
  const Title = extract(element, REGEX.List.Title, [])
  const TypeId = extract(element, REGEX.List.TypeId, [])
  const TypeName = extract(element, REGEX.List.TypeName, [])
  const SubgroupId = extract(element, REGEX.List.SubgroupId, [])
  const SubgroupName = extract(element, REGEX.List.SubgroupName, [])
  const Magnet = extract(element, REGEX.List.Magnet, [])
  const PageUrl = extract(element, REGEX.List.PageUrl, [])
  const FileSize = extract(element, REGEX.List.FileSize, [])
  const PublishDate = extract(element, REGEX.List.PublishDate, [])
  return {
    Title: Title === null ? UNKNOWN.Title : Title.trim().replace(REGEX.List.TitleReplacer, '$1'),
    TypeId: Number(TypeId) || UNKNOWN.TypeId,
    TypeName: TypeName || UNKNOWN.TypeName,
    SubgroupId: Number(SubgroupId) || UNKNOWN.SubgroupId,
    SubgroupName: SubgroupName || UNKNOWN.SubgroupName,
    Magnet: Magnet || UNKNOWN.Magnet,
    PageUrl: PageUrl === null ? UNKNOWN.PageUrl : BASE + PageUrl,
    FileSize: FileSize || UNKNOWN.FileSize,
    PublishDate: PublishDate === null ? UNKNOWN.PublishDate : formatLocaleString(PublishDate),
  }
}
const ASSET =
  'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html'
const DEFAULT = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>弹弹play资源搜索节点API - v\${VERSION}</title>
</head>
<body>
  <h1>使用说明</h1>
  <h2>GitHub - <a href="\${HOMEPAGE}">LussacZheng/dandanplay-resource-service</a></h2>
  <p>（主页加载失败，此页面为默认页面）</p>
</body>
</html>
`
async function fetchIndex(version, homepage, impl = 'ts-impl') {
  try {
    const html = await get(ASSET)
    return template(html, {
      VERSION: version,
      IMPL: impl,
    })
  } catch (err) {
    console.error(err)
    return template(DEFAULT, {
      VERSION: version,
      HOMEPAGE: homepage,
    })
  }
}
function generateMetaInfo(coreInfo) {
  return {
    name: coreInfo.name,
    version: coreInfo.version,
    dev: !/^[\d\.]+$/.test(coreInfo.version),
    info: {
      homepage: coreInfo.homepage,
      description: coreInfo.description,
    },
    meta: {
      implementation: {
        platform: coreInfo.platform,
        tool: coreInfo.tool,
        version: '1.27.1',
      },
      git_commit_hash: '56bbda98151d35da4aaead93f1ecd301b18ad36d',
      build_at: '2022-11-08T13:18:25Z',
    },
    options: {
      instruction: 'https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs',
      supported: ['$realtime', '$page', '$limit'],
    },
  }
}
const { name, version, homepage } = __default
const description =
  "API implementation for 'dandanplay' resource search service, based on TypeScript and Deno Deploy."
const routes = {
  'GET@/subgroup': async () => {
    const data = await generateSubgroup()
    return new Response(JSON.stringify(data), ResInitJson)
  },
  'GET@/type': async () => {
    const data = await generateType()
    return new Response(JSON.stringify(data), ResInitJson)
  },
  'GET@/list': async (req) => {
    const data = await generateList(req.url)
    return new Response(JSON.stringify(data), ResInitJson)
  },
  '/': async () => new Response(await fetchIndex(version, homepage, 'deno-impl'), ResInitHtml),
  'GET@/self': () => {
    return new Response(
      JSON.stringify(
        generateMetaInfo({
          name,
          version,
          homepage,
          description,
          platform: 'deno-deploy',
          tool: 'deno',
        }),
      ),
      ResInitJson,
    )
  },
  '*': () =>
    new Response('Not Found.', {
      status: 404,
    }),
}

serve(router(routes))
