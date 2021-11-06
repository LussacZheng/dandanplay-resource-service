'use strict'

import { sify } from 'chinese-conv'

import SearchOptions from './search-option'
import { template, formatLocaleString } from '../utils/helper'
import htmlparser from '../utils/htmlparser'
import { get } from '../utils/request'

const BASE = 'https://share.dmhy.org'
const DMHY = {
  type_and_subgroup_url: `${BASE}/topics/advanced-search?team_id=0&sort_id=0&orderby=`,
  list_url: `${BASE}/topics/list/page/\${page}?keyword=\${keyword}&sort_id=\${type}&team_id=\${subgroup}&order=date-desc`,
  index_url: `${BASE}/topics/list/page/\${realtime}`,
}

/**
 * Return a predefined special value if certain fields failed to parse.
 *
 * Note: These "predefined special values" are not officially defined by dandanplay.
 *       Just some temporary placeholders.
 */
const UNKNOWN = {
  Title: '未能成功解析标题',
  TypeId: -2,
  TypeName: '未能成功解析类别',
  SubgroupId: -1,
  SubgroupName: '未知字幕组',
  /**
   * If some expired resource didn't provide the magnetic link,
   *   only by returning the string with certain format (with prefix "magnet"),
   * can the `java.lang.StringIndexOutOfBoundsException` on Android client be avoided.
   *
   * For example, try to search "你好安妮"
   */
  Magnet: 'magnet_not_found_未能成功解析磁力链接或磁力链接不存在',
  PageUrl: '未能成功解析资源发布页面',
  FileSize: '未能成功解析资源大小',
  PublishDate: '1970-01-01 08:00:00',
}

const REGEX = {
  // <option value="459">紫音動漫&amp;發佈組</option>
  Subgroups: /<option value="(\d+)">(.+?)<\/option>/gim,

  // <option value="31" style="color: red">季度全集</option>
  // or: <option value="9" style="color: #0eb9e7">遊戲</option>
  Types: /<option value="(\d+)" style="color: [\w#]+">(.+?)<\/option>/gim,

  List: {
    // <a href="/topics/list/page/2?keyword=xxx">下一頁</a>
    HasMore: /下一頁/g,

    // $('table#topic_list tbody tr')
    Resources: /<tr class="">(.*?)<\/tr>/gis,

    // href="/topics/list/sort_id/2">
    TypeId: /href="\/topics\/list\/sort_id\/(\d+)"/gim,
    // <font color=red>動畫</font></a>
    // or: <font color=#0eb9e7>遊戲</font>
    TypeName: /<font color=[\w#]+>(.+)<\/font>/gim,
    // <a  href="/topics/list/team_id/123" >
    SubgroupId: /href="\/topics\/list\/team_id\/(\d+)"/gim,
    // XX字幕组</a></span>
    SubgroupName: /\s+(.*)<\/a><\/span>/gim,
    // href="magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&dn=&tr=http"
    Magnet: /href="(magnet:\?xt=urn:btih:.+?)"/gim,
    // <a href="/topics/view/123456.html" target="_blank">
    PageUrl: /href="(.+?)"\s*target="_blank"/gim,
    // <td nowrap="nowrap" align="center">123.4MB</td>
    FileSize: /<td.*>([\w\.]+B)<\/td>/gim,
    // <span style="display: none;">2021/01/01 01:11</span>
    PublishDate: /<span style="display: none;">([\d\/ :]+)<\/span>/gim,

    // just the text inside <a> of `PageUrl`
    // <a href="/topics/view/123456.html" target="_blank"> xxxxx <span class="keyword">KEYWORD</span>／xxxxx </a>
    Title: /target="_blank" ?>(.+?)<\/a>/gis,
    TitleReplacer: /<span class="keyword">(.*?)<\/span>/gi,
  },
}

/**
 * @async
 */
async function generateSubgroup() {
  const html = await get(DMHY.type_and_subgroup_url)
  return { Subgroups: extractSubgroups(html) }
}

/**
 * @async
 */
async function generateType() {
  const html = await get(DMHY.type_and_subgroup_url)
  return { Types: extractTypes(html) }
}

/**
 * @async
 * @param {Request} request
 */
async function generateList(request) {
  const params = new URL(encodeURI(request.url)).searchParams
  let type = parseInt(params.get('type')) || 0
  let subgroup = parseInt(params.get('subgroup')) || 0
  type = type < 0 ? 0 : type
  subgroup = subgroup < 0 ? 0 : subgroup

  const { keyword, options } = new SearchOptions(decodeURIComponent(params.get('keyword')))

  const fetchURL = encodeURI(
    template(DMHY.list_url, {
      page: options.page,
      keyword,
      type,
      subgroup,
    }),
  )
  let html = await get(fetchURL)
  let result = extractList(html)

  if (options.realtime) {
    const fetchURL_realtime = encodeURI(template(DMHY.index_url, { realtime: options.realtime }))
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

/**
 * Extract subgroup info from HTML text
 * @param {String} html HTML text string
 * @returns {Array<Object<string, number | string>>}
 */
function extractSubgroups(html) {
  const decodedHtml = html.replace(/&amp;/gi, '&')
  let subgroups = htmlparser(decodedHtml, REGEX.Subgroups, ['Id', 'Name'], 'all')

  // If parsing fails, return an empty array
  if (subgroups === null) return []

  subgroups.forEach(item => (item['Id'] = parseInt(item['Id'])))

  // duplicate matched strings: '<option value="0">全部</option>'
  subgroups.shift()

  // uncomment to return the ordered array
  // subgroups.sort((a, b) => a['Id'] - b['Id'])

  return subgroups
}

/**
 * Extract type info from HTML text
 * @param {String} html HTML text string
 * @returns {Array<Object<string, number | string>>}
 */
function extractTypes(html) {
  let types = htmlparser(html, REGEX.Types, ['Id', 'Name'], 'all')

  // If parsing fails, return an empty array
  if (types === null) return []

  types.forEach(item => (item['Id'] = parseInt(item['Id'])))

  // lost matched string: '<option value="0">全部</option>'
  types.unshift({ Id: 0, Name: '全部' })

  // uncomment to return the ordered array
  // types.sort((a, b) => a['Id'] - b['Id'])

  return types
}

/**
 * Extract list info from HTML text
 * @param {String} html HTML text string
 * @returns {Object<string, boolean | Array<Object<string, number | string>>>}
 */
function extractList(html) {
  let result = {
    HasMore: htmlparser(html, REGEX.List.HasMore, []) !== null,
    Resources: [],
  }

  // Get all search results in `table#topic_list tbody tr`
  const elements = htmlparser(html, REGEX.List.Resources, [], 'all')

  // If there are no search results, return an empty array
  if (elements === null) return result

  elements.forEach(e => {
    result.Resources.push(extractListFromElement(e))
  })

  return result
}

/**
 * Extract extra Resources info from HTML text, with SearchOption: $realtime
 * @param {String} html HTML text string
 * @param {String} keyword only Resource that contains the keyword will be extracted
 * @param {Number} subgroup only Resource that matches the subgroup will be extracted
 * @param {Number} type only Resource that matches the type will be extracted
 * @param {Array} originalRes Resource that already exists will be ignored
 * @returns {Array<Object<string, number | string>>}
 */
function extraResourcesForOptionRealtime(html, keyword, subgroup, type, originalRes) {
  let resources = []

  const elements = htmlparser(html, REGEX.List.Resources, [], 'all')

  if (elements === null) return []

  elements.forEach(e => {
    let res = extractListFromElement(e)
    // Unable to recognize the same simplified and traditional Chinese characters
    const isKeywordMatched = keyword.split(' ').every(word => {
      // NOTE: anyString.includes('') === true
      // so keyword with multi-whitespace is allowed
      return sify(res.Title.toLowerCase()).includes(sify(word.toLowerCase()))
    })
    const isSubgroupMatched = subgroup === 0 ? true : res.SubgroupId === subgroup
    const isTypeMatched = type === 0 ? true : res.TypeId === type
    const isDuplicated = originalRes.some(item => res.PageUrl === item.PageUrl)
    if (isKeywordMatched && isSubgroupMatched && isTypeMatched && !isDuplicated) {
      resources.push(res)
    }
  })

  return resources
}

/**
 * Extract item info from a single HTML element
 * @param {String} element
 * @returns {Object<string, number | string>}
 */
function extractListFromElement(element) {
  const Title = htmlparser(element, REGEX.List.Title, [])
  const TypeId = htmlparser(element, REGEX.List.TypeId, [])
  const TypeName = htmlparser(element, REGEX.List.TypeName, [])
  const SubgroupId = htmlparser(element, REGEX.List.SubgroupId, [])
  const SubgroupName = htmlparser(element, REGEX.List.SubgroupName, [])
  const Magnet = htmlparser(element, REGEX.List.Magnet, [])
  const PageUrl = htmlparser(element, REGEX.List.PageUrl, [])
  const FileSize = htmlparser(element, REGEX.List.FileSize, [])
  const PublishDate = htmlparser(element, REGEX.List.PublishDate, [])

  return {
    // `htmlparser` may return `null` if parsing fails. If so, give them a default value
    Title: Title === null ? UNKNOWN.Title : Title.trim().replace(REGEX.List.TitleReplacer, '$1'),
    TypeId: parseInt(TypeId) || UNKNOWN.TypeId,
    TypeName: TypeName || UNKNOWN.TypeName,
    SubgroupId: parseInt(SubgroupId) || UNKNOWN.SubgroupId,
    SubgroupName: SubgroupName || UNKNOWN.SubgroupName,
    Magnet: Magnet || UNKNOWN.Magnet,
    PageUrl: PageUrl === null ? UNKNOWN.PageUrl : BASE + PageUrl,
    FileSize: FileSize || UNKNOWN.FileSize,
    PublishDate: PublishDate === null ? UNKNOWN.PublishDate : formatLocaleString(PublishDate),
  }
}

export { generateSubgroup, generateType, generateList }
