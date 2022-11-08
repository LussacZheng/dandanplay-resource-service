// https://github.com/LussacZheng/dandanplay-resource-service
// version: 0.0.5-alpha
// build: 2022-11-08 21:19:17 GMT+0800
// wrangler: 2.1.15

var h = { headers: { 'content-type': 'application/json;charset=utf-8' } },
  R = { headers: { 'content-type': 'text/html;charset=utf-8' } }
var j = {
  headers: {
    accept: 'text/html;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
}
async function m(e, r = j) {
  let t = await fetch(decodeURI(e), r)
  if (!t.ok) throw new Error(`Bad response from server: ${t.status}`)
  return await C(t)
}
async function C(e) {
  let { headers: r } = e,
    t = r.get('content-type')
  return t?.includes('application/json')
    ? await e.json()
    : t?.includes('application/text')
    ? await e.text()
    : t?.includes('text/html')
    ? await e.text()
    : await e.text()
}
var b = class {
    constructor(r) {
      let { keyword: t, options: s } = G(r)
      ;(this.keyword = t),
        (this.options = {
          realtime: s.realtime || w.UNUSED.realtime,
          page: s.page || w.UNUSED.page,
          limit: s.limit || w.UNUSED.limit,
        })
    }
  },
  w = {
    UNUSED: { realtime: 0, page: 1, limit: 200 },
    UNASSIGNED: { realtime: 1, page: 1, limit: 80 },
    UNDEFINED: 1,
  }
function G(e) {
  let r = {}
  return {
    keyword: e
      .replace(/(?: |^)\$([a-z]+)(?::(\d+))?(?=\s|$)/g, (s, n, o) => {
        let p = parseInt(o)
        return (r[n] = isNaN(p) ? w.UNASSIGNED[n] || w.UNDEFINED : p), ''
      })
      .replace(/\$\$/g, '$'),
    options: r,
  }
}
function J(e, r, t, s = 'first') {
  switch (s) {
    case 'all':
      return q(e, r, t)
    case 'last':
      return W(e, r, t)
    default:
      return Z(e, r, t)
  }
}
function Z(e, r, t) {
  let s = r.exec(e)
  return (r.lastIndex = 0), s === null ? null : I(s, t)
}
function W(e, r, t) {
  let s = [...e.matchAll(r)],
    n = s[s.length - 1]
  return s.length === 0 ? null : I(n, t)
}
function q(e, r, t) {
  let s = e.matchAll(r),
    n = Array.from(s, (o) => I(o, t))
  return n.length === 0 ? null : n
}
function I(e, r) {
  if (!r || !r.length) return e[1]
  let t = {}
  return (
    r.length > e.length - 1 && r.splice(e.length - 1),
    r.forEach((s, n) => {
      t[s] = e[n + 1]
    }),
    t
  )
}
var i = J
function D(e, r) {
  let t = new Date(e).toLocaleString('default', {
    formatMatcher: 'best fit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZone: r,
  })
  return new Date(t + ' GMT').toISOString().substring(0, 19).replace('T', ' ')
}
function f(e, r) {
  return e.replace(/\$\{([\w-]+)\}/g, (t, s) => `${r[s] ?? t}`)
}
var x = 'https://share.dmhy.org',
  S = {
    type_and_subgroup_url: `${x}/topics/advanced-search?team_id=0&sort_id=0&orderby=`,
    list_url: `${x}/topics/list/page/\${page}?keyword=\${keyword}&sort_id=\${type}&team_id=\${subgroup}&order=date-desc`,
    index_url: `${x}/topics/list/page/\${realtime}`,
  },
  l = {
    Title: '\u672A\u80FD\u6210\u529F\u89E3\u6790\u6807\u9898',
    TypeId: -2,
    TypeName: '\u672A\u80FD\u6210\u529F\u89E3\u6790\u7C7B\u522B',
    SubgroupId: -1,
    SubgroupName: '\u672A\u77E5\u5B57\u5E55\u7EC4',
    Magnet:
      'magnet_not_found_\u672A\u80FD\u6210\u529F\u89E3\u6790\u78C1\u529B\u94FE\u63A5\u6216\u78C1\u529B\u94FE\u63A5\u4E0D\u5B58\u5728',
    PageUrl: '\u672A\u80FD\u6210\u529F\u89E3\u6790\u8D44\u6E90\u53D1\u5E03\u9875\u9762',
    FileSize: '\u672A\u80FD\u6210\u529F\u89E3\u6790\u8D44\u6E90\u5927\u5C0F',
    PublishDate: '1970-01-01 08:00:00',
  },
  c = {
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
async function N() {
  let e = await m(S.type_and_subgroup_url)
  return { Subgroups: V(e) }
}
async function T() {
  let e = await m(S.type_and_subgroup_url)
  return { Types: B(e) }
}
async function L(e) {
  let r = new URL(encodeURI(e)).searchParams,
    t = Number(r.get('type')) || 0,
    s = Number(r.get('subgroup')) || 0
  ;(t = t < 0 ? 0 : t), (s = s < 0 ? 0 : s)
  let { keyword: n, options: o } = new b(decodeURIComponent(r.get('keyword') || '')),
    p = encodeURI(f(S.list_url, { page: o.page, keyword: n, type: t, subgroup: s })),
    u = await m(p),
    a = K(u)
  if (o.realtime) {
    let d = encodeURI(f(S.index_url, { realtime: o.realtime }))
    u = await m(d)
    let y = Y(u, n, s, t, a.Resources)
    a.Resources = y.concat(a.Resources)
  }
  return a.Resources.length > o.limit && (a.Resources = a.Resources.slice(0, o.limit)), a
}
function V(e) {
  let r = e.replace(/&amp;/gi, '&'),
    t = i(r, c.Subgroups, ['Id', 'Name'], 'all')
  if (t === null) return []
  let s = t.map((n) => M(n))
  return s.shift(), s
}
function B(e) {
  let r = i(e, c.Types, ['Id', 'Name'], 'all')
  if (r === null) return []
  let t = r.map((s) => M(s))
  return t.unshift({ Id: 0, Name: '\u5168\u90E8' }), t
}
function K(e) {
  let r = { HasMore: i(e, c.List.HasMore, []) !== null, Resources: [] },
    t = i(e, c.List.Resources, [], 'all')
  return (
    t === null ||
      t.forEach((s) => {
        r.Resources.push(P(s))
      }),
    r
  )
}
function M(e) {
  return { Id: parseInt(e.Id), Name: e.Name }
}
function Y(e, r, t, s, n) {
  let o = [],
    p = i(e, c.List.Resources, [], 'all')
  return p === null
    ? []
    : (p.forEach((u) => {
        let a = P(u),
          d = r.split(' ').every((v) => a.Title.toLowerCase().includes(v.toLowerCase())),
          y = t === 0 ? !0 : a.SubgroupId === t,
          H = s === 0 ? !0 : a.TypeId === s,
          z = n.some((v) => a.PageUrl === v.PageUrl)
        d && y && H && !z && o.push(a)
      }),
      o)
}
function P(e) {
  let r = i(e, c.List.Title, []),
    t = i(e, c.List.TypeId, []),
    s = i(e, c.List.TypeName, []),
    n = i(e, c.List.SubgroupId, []),
    o = i(e, c.List.SubgroupName, []),
    p = i(e, c.List.Magnet, []),
    u = i(e, c.List.PageUrl, []),
    a = i(e, c.List.FileSize, []),
    d = i(e, c.List.PublishDate, [])
  return {
    Title: r === null ? l.Title : r.trim().replace(c.List.TitleReplacer, '$1'),
    TypeId: Number(t) || l.TypeId,
    TypeName: s || l.TypeName,
    SubgroupId: Number(n) || l.SubgroupId,
    SubgroupName: o || l.SubgroupName,
    Magnet: p || l.Magnet,
    PageUrl: u === null ? l.PageUrl : x + u,
    FileSize: a || l.FileSize,
    PublishDate: d === null ? l.PublishDate : D(d),
  }
}
var X = 'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html',
  Q = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>\u5F39\u5F39play\u8D44\u6E90\u641C\u7D22\u8282\u70B9API - v\${VERSION}</title>
</head>
<body>
  <h1>\u4F7F\u7528\u8BF4\u660E</h1>
  <h2>GitHub - <a href="\${HOMEPAGE}">LussacZheng/dandanplay-resource-service</a></h2>
  <p>\uFF08\u4E3B\u9875\u52A0\u8F7D\u5931\u8D25\uFF0C\u6B64\u9875\u9762\u4E3A\u9ED8\u8BA4\u9875\u9762\uFF09</p>
</body>
</html>
`
async function _(e, r, t = 'ts-impl') {
  try {
    let s = await m(X)
    return f(s, { VERSION: e, IMPL: t })
  } catch (s) {
    return console.error(s), f(Q, { VERSION: e, HOMEPAGE: r })
  }
}
function k(e) {
  return {
    name: e.name,
    version: e.version,
    dev: !/^[\d\.]+$/.test(e.version),
    info: { homepage: e.homepage, description: e.description },
    meta: {
      implementation: { platform: e.platform, tool: e.tool, version: '2.1.15' },
      git_commit_hash: '56bbda98151d35da4aaead93f1ecd301b18ad36d',
      build_at: '2022-11-08T13:19:17Z',
    },
    options: {
      instruction: 'https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs',
      supported: ['$realtime', '$page', '$limit'],
    },
  }
}
function A({ base: e = '', routes: r = [] } = {}) {
  return {
    __proto__: new Proxy(
      {},
      {
        get:
          (t, s, n) =>
          (o, ...p) =>
            r.push([
              s.toUpperCase(),
              RegExp(
                `^${(e + o)
                  .replace(/(\/?)\*/g, '($1.*)?')
                  .replace(/(\/$)|((?<=\/)\/)/, '')
                  .replace(/:(\w+)(\?)?(\.)?/g, '$2(?<$1>[^/]+)$2$3')
                  .replace(/\.(?=[\w(])/, '\\.')
                  .replace(/\)\.\?\(([^\[]+)\[\^/g, '?)\\.?($1(?<=\\.)[^\\.')}/*$`,
              ),
              p,
            ]) && n,
      },
    ),
    routes: r,
    async handle(t, ...s) {
      let n,
        o,
        p = new URL(t.url)
      t.query = Object.fromEntries(p.searchParams)
      for (var [u, a, d] of r)
        if ((u === t.method || u === 'ALL') && (o = p.pathname.match(a))) {
          t.params = o.groups
          for (var y of d) if ((n = await y(t.proxy || t, ...s)) !== void 0) return n
        }
    },
  }
}
var F = 'dandanplay-resource-service',
  U = '0.0.5-alpha'
var E = 'https://github.com/LussacZheng/dandanplay-resource-service'
var O =
  "API implementation for 'dandanplay' resource search service, based on TypeScript and Cloudflare Workers."
var g = A()
g.get('/subgroup', async () => {
  let e = await N()
  return new Response(JSON.stringify(e), h)
})
g.get('/type', async () => {
  let e = await T()
  return new Response(JSON.stringify(e), h)
})
g.get('/list', async (e) => {
  let r = await L(e.url)
  return new Response(JSON.stringify(r), h)
})
g.get('/', async () => new Response(await _(U, E, 'cfw-impl'), R))
g.get(
  '/self',
  () =>
    new Response(
      JSON.stringify(
        k({
          name: F,
          version: U,
          homepage: E,
          description: O,
          platform: 'cf-worker',
          tool: 'wrangler',
        }),
      ),
      h,
    ),
)
g.all('*', () => new Response('Not Found.', { status: 404 }))
var _e = { fetch: g.handle }
export { _e as default }
