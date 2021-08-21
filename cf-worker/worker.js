// https://github.com/LussacZheng/dandanplay-resource-service
// version: 0.0.4-beta
// build: 2021-08-21 14:36:52 GMT+0800
// wrangler: 1.19.0

!(function (e) {
  var t = {}
  function n(r) {
    if (t[r]) return t[r].exports
    var o = (t[r] = { i: r, l: !1, exports: {} })
    return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports
  }
  ;(n.m = e),
    (n.c = t),
    (n.d = function (e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r })
    }),
    (n.r = function (e) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 })
    }),
    (n.t = function (e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e
      if (4 & t && 'object' == typeof e && e && e.__esModule) return e
      var r = Object.create(null)
      if (
        (n.r(r),
        Object.defineProperty(r, 'default', { enumerable: !0, value: e }),
        2 & t && 'string' != typeof e)
      )
        for (var o in e)
          n.d(
            r,
            o,
            function (t) {
              return e[t]
            }.bind(null, o),
          )
      return r
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default
            }
          : function () {
              return e
            }
      return n.d(t, 'a', t), t
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t)
    }),
    (n.p = ''),
    n((n.s = 1))
})([
  function (e) {
    e.exports = JSON.parse(
      '{"c":"dandanplay-resource-service","d":"0.0.4-beta","a":"API for \'dandanplay\' resource search service, based on Cloudflare Workers.","b":"https://github.com/LussacZheng/dandanplay-resource-service"}',
    )
  },
  function (e, t, n) {
    'use strict'
    n.r(t)
    class r {
      constructor(e) {
        const { keyword: t, options: n } = (function (e) {
          let t = {}
          return {
            keyword: e
              .replace(/ ?(?<!\$|\w)\$([a-z]+)(?::(\d+))?(?=\s|$)/gi, (e, n, r) => {
                const a = parseInt(r)
                return (t[n] = isNaN(a) ? o.UNASSIGNED[n] || o.UNDEFINED : a), ''
              })
              .replace(/\$\$/g, '$'),
            options: t,
          }
        })(e)
        ;(this.keyword = t),
          (this.options = {
            realtime: n.realtime || o.UNUSED.realtime,
            page: n.page || o.UNUSED.page,
            limit: n.limit || o.UNUSED.limit,
          })
      }
    }
    const o = {
      UNUSED: { realtime: 0, page: 1, limit: 200 },
      UNASSIGNED: { realtime: 1, page: 1, limit: 80 },
      UNDEFINED: 1,
    }
    function a(e, t) {
      return e.replace(/\$\{(\w+)\}/gi, (e, n) => t[n])
    }
    function s(e, t) {
      const n = new Date(e).toLocaleString('default', {
        formatMatcher: 'best fit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZone: t,
      })
      return new Date(n + ' UTC').toISOString().substring(0, 19).replace('T', ' ')
    }
    function i(e, t) {
      if (0 === t.length) return e[1]
      let n = {}
      return (
        t.length > e.length - 1 && t.splice(e.length - 1),
        t.forEach((t, r) => {
          n[t] = e[r + 1]
        }),
        n
      )
    }
    var l = function (e, t, n, r = 'first') {
      switch (r) {
        case 'all':
          return (function (e, t, n) {
            const r = e.matchAll(t),
              o = Array.from(r, (e) => i(e, n))
            return 0 === o.length ? null : o
          })(e, t, n)
        case 'last':
          return (function (e, t, n) {
            const r = [...e.matchAll(t)],
              o = r[r.length - 1]
            return 0 === r.length ? null : i(o, n)
          })(e, t, n)
        default:
          return (function (e, t, n) {
            let r = t.exec(e)
            return (t.lastIndex = 0), null === r ? null : i(r, n)
          })(e, t, n)
      }
    }
    const c = { headers: { 'content-type': 'application/json;charset=utf-8' } },
      u = { headers: { 'content-type': 'text/html;charset=utf-8' } },
      d = {
        headers: {
          accept: 'text/html;charset=utf-8',
          'user-agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
      }
    async function p(e, t = d) {
      let n
      try {
        n = await fetch(decodeURI(e), t)
      } catch (e) {
        console.error(e)
      }
      return await (async function (e) {
        const { headers: t } = e,
          n = t.get('content-type')
        return n.includes('application/json')
          ? await e.json()
          : (n.includes('application/text') || n.includes('text/html'), await e.text())
      })(n)
    }
    const h = 'https://share.dmhy.org',
      g = {
        type_and_subgroup_url: h + '/topics/advanced-search?team_id=0&sort_id=0&orderby=',
        list_url:
          h +
          '/topics/list/page/${page}?keyword=${keyword}&sort_id=${type}&team_id=${subgroup}&order=date-desc',
        index_url: h + '/topics/list/page/${realtime}',
      },
      f = '未能成功解析标题',
      m = -2,
      y = '未能成功解析类别',
      w = -1,
      b = '未知字幕组',
      I = 'magnet_not_found_未能成功解析磁力链接或磁力链接不存在',
      _ = '未能成功解析资源发布页面',
      v = '未能成功解析资源大小',
      S = '1970-01-01 08:00:00',
      N = /<option value="(\d+)">(.+?)<\/option>/gim,
      R = /<option value="(\d+)" style="color: [\w#]+">(.+?)<\/option>/gim,
      U = {
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
      }
    async function T(e) {
      const t = new URL(encodeURI(e.url)).searchParams
      let n = parseInt(t.get('type')) || 0,
        o = parseInt(t.get('subgroup')) || 0
      ;(n = n < 0 ? 0 : n), (o = o < 0 ? 0 : o)
      const { keyword: s, options: i } = new r(decodeURIComponent(t.get('keyword'))),
        c = encodeURI(a(g.list_url, { page: i.page, keyword: s, type: n, subgroup: o }))
      let u = await p(c),
        d = (function (e) {
          let t = { HasMore: null !== l(e, U.HasMore, []), Resources: [] }
          const n = l(e, U.Resources, [], 'all')
          return (
            null === n ||
              n.forEach((e) => {
                t.Resources.push(E(e))
              }),
            t
          )
        })(u)
      if (i.realtime) {
        const e = encodeURI(a(g.index_url, { realtime: i.realtime }))
        u = await p(e)
        const t = (function (e, t, n, r, o) {
          let a = []
          const s = l(e, U.Resources, [], 'all')
          return null === s
            ? []
            : (s.forEach((e) => {
                let s = E(e)
                const i = t
                    .split(' ')
                    .every((e) => s.Title.toLowerCase().includes(e.toLowerCase())),
                  l = 0 === n || s.SubgroupId === n,
                  c = 0 === r || s.TypeId === r,
                  u = o.some((e) => s.PageUrl === e.PageUrl)
                i && l && c && !u && a.push(s)
              }),
              a)
        })(u, s, o, n, d.Resources)
        d.Resources = t.concat(d.Resources)
      }
      return d.Resources.length > i.limit && (d.Resources = d.Resources.slice(0, i.limit)), d
    }
    function x(e) {
      const t = e.replace(/&amp;/gi, '&')
      let n = l(t, N, ['Id', 'Name'], 'all')
      return null === n ? [] : (n.forEach((e) => (e.Id = parseInt(e.Id))), n.shift(), n)
    }
    function $(e) {
      let t = l(e, R, ['Id', 'Name'], 'all')
      return null === t
        ? []
        : (t.forEach((e) => (e.Id = parseInt(e.Id))), t.unshift({ Id: 0, Name: '全部' }), t)
    }
    function E(e) {
      const t = l(e, U.Title, []),
        n = l(e, U.TypeId, []),
        r = l(e, U.TypeName, []),
        o = l(e, U.SubgroupId, []),
        a = l(e, U.SubgroupName, []),
        i = l(e, U.Magnet, []),
        c = l(e, U.PageUrl, []),
        u = l(e, U.FileSize, []),
        d = l(e, U.PublishDate, [])
      return {
        Title: null === t ? f : t.trim().replace(U.TitleReplacer, '$1'),
        TypeId: parseInt(n) || m,
        TypeName: r || y,
        SubgroupId: parseInt(o) || w,
        SubgroupName: a || b,
        Magnet: i || I,
        PageUrl: null === c ? _ : h + c,
        FileSize: u || v,
        PublishDate: null === d ? S : s(d),
      }
    }
    var P = n(0)
    const D = `\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width,initial-scale=1" />\n  <title>弹弹play资源搜索节点API - v${P.d}</title>\n</head>\n<body>\n  <h1>使用说明</h1>\n  <h2>GitHub - <a href="${P.b}">LussacZheng/dandanplay-resource-service</a></h2>\n</body>\n</html>\n`
    const O = (e) => (t) => t.method.toLowerCase() === e.toLowerCase(),
      k = O('connect'),
      L = O('delete'),
      M = O('get'),
      j = O('head'),
      C = O('options'),
      A = O('patch'),
      F = O('post'),
      z = O('put'),
      Z = O('trace'),
      J = (e) => (t) => {
        const n = new URL(encodeURI(t.url)).pathname
        return (n.match(e) || [])[0] === n
      }
    var G = class {
      constructor() {
        this.routes = []
      }
      handle(e, t) {
        return this.routes.push({ conditions: e, handler: t }), this
      }
      connect(e, t) {
        return this.handle([k, J(e)], t)
      }
      delete(e, t) {
        return this.handle([L, J(e)], t)
      }
      get(e, t) {
        return this.handle([M, J(e)], t)
      }
      head(e, t) {
        return this.handle([j, J(e)], t)
      }
      options(e, t) {
        return this.handle([C, J(e)], t)
      }
      patch(e, t) {
        return this.handle([A, J(e)], t)
      }
      post(e, t) {
        return this.handle([F, J(e)], t)
      }
      put(e, t) {
        return this.handle([z, J(e)], t)
      }
      trace(e, t) {
        return this.handle([Z, J(e)], t)
      }
      all(e) {
        return this.handle([], e)
      }
      route(e) {
        const t = this.resolve(e)
        return t
          ? t.handler(e)
          : new Response('resource not found', {
              status: 404,
              statusText: 'not found',
              headers: { 'content-type': 'text/plain' },
            })
      }
      resolve(e) {
        return this.routes.find(
          (t) =>
            !(t.conditions && (!Array.isArray(t) || t.conditions.length)) ||
            ('function' == typeof t.conditions ? t.conditions(e) : t.conditions.every((t) => t(e))),
        )
      }
    }
    async function H(e) {
      const t = new G()
      t.get('/subgroup', async () => {
        const e = await (async function () {
          return { Subgroups: x(await p(g.type_and_subgroup_url)) }
        })()
        return new Response(JSON.stringify(e), c)
      }),
        t.get('/type', async () => {
          const e = await (async function () {
            return { Types: $(await p(g.type_and_subgroup_url)) }
          })()
          return new Response(JSON.stringify(e), c)
        }),
        t.get('/list', async (e) => {
          const t = await T(e)
          return new Response(JSON.stringify(t), c)
        }),
        t.get(
          '/',
          async () =>
            new Response(
              await (async function () {
                let e
                try {
                  ;(e = await p(
                    'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html',
                  )),
                    (e = a(e, { VERSION: P.d }))
                } catch (t) {
                  e = D
                }
                return e
              })(),
              u,
            ),
        ),
        t.get(
          '/self',
          () =>
            new Response(
              JSON.stringify({
                name: P.c,
                version: P.d,
                dev: !/^[\d\.]+$/.test(P.d),
                info: { homepage: P.b, description: P.a },
                meta: {
                  implementation: 'cf-worker',
                  git_commit_hash: 'c8f931e2d18074120cefb4635b2f219bd2397860',
                  build_at: '2021-08-21T06:36:52Z',
                  wrangler_version: '1.19.0',
                  golang_version: 'none',
                },
                options: {
                  instruction:
                    'https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs',
                  supported: ['$realtime', '$page', '$limit'],
                },
              }),
              c,
            ),
        )
      return await t.route(e)
    }
    addEventListener('fetch', (e) => e.respondWith(H(e.request)))
  },
])
