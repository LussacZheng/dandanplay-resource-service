// https://github.com/LussacZheng/dandanplay-resource-service
// version: 0.0.2

!(function(e) {
  var t = {}
  function n(r) {
    if (t[r]) return t[r].exports
    var a = (t[r] = { i: r, l: !1, exports: {} })
    return e[r].call(a.exports, a, a.exports, n), (a.l = !0), a.exports
  }
  ;(n.m = e),
    (n.c = t),
    (n.d = function(e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r })
    }),
    (n.r = function(e) {
      'undefined' != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
        Object.defineProperty(e, '__esModule', { value: !0 })
    }),
    (n.t = function(e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e
      if (4 & t && 'object' == typeof e && e && e.__esModule) return e
      var r = Object.create(null)
      if (
        (n.r(r),
        Object.defineProperty(r, 'default', { enumerable: !0, value: e }),
        2 & t && 'string' != typeof e)
      )
        for (var a in e)
          n.d(
            r,
            a,
            function(t) {
              return e[t]
            }.bind(null, a),
          )
      return r
    }),
    (n.n = function(e) {
      var t =
        e && e.__esModule
          ? function() {
              return e.default
            }
          : function() {
              return e
            }
      return n.d(t, 'a', t), t
    }),
    (n.o = function(e, t) {
      return Object.prototype.hasOwnProperty.call(e, t)
    }),
    (n.p = ''),
    n((n.s = 1))
})([
  function(e) {
    e.exports = { b: '0.0.2', a: 'https://github.com/LussacZheng/dandanplay-resource-service' }
  },
  function(e, t, n) {
    'use strict'
    function r(e) {
      const t = new Date(e).toLocaleString('default', {
        formatMatcher: 'best fit',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
      })
      return new Date(t + ' UTC')
        .toISOString()
        .substr(0, 19)
        .replace('T', ' ')
    }
    function a(e, t) {
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
    n.r(t)
    var o = function(e, t, n, r = 'first') {
      switch (r) {
        case 'all':
          return (function(e, t, n) {
            const r = e.matchAll(t),
              o = Array.from(r, e => a(e, n))
            return 0 === o.length ? null : o
          })(e, t, n)
        case 'last':
          return (function(e, t, n) {
            const r = [...e.matchAll(t)],
              o = r[r.length - 1]
            return 0 === r.length ? null : a(o, n)
          })(e, t, n)
        default:
          return (function(e, t, n) {
            let r = t.exec(e)
            return (t.lastIndex = 0), null === r ? null : a(r, n)
          })(e, t, n)
      }
    }
    const s = { headers: { 'content-type': 'application/json;charset=utf-8' } },
      i = { headers: { 'content-type': 'text/html;charset=utf-8' } },
      u = {
        headers: {
          accept: 'text/html;charset=utf-8',
          'user-agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
      }
    async function c(e, t = u) {
      const n = await fetch(decodeURI(e), t)
      return await (async function(e) {
        const { headers: t } = e,
          n = t.get('content-type')
        return n.includes('application/json')
          ? await e.json()
          : (n.includes('application/text') || n.includes('text/html'), await e.text())
      })(n)
    }
    const l = 'https://share.dmhy.org',
      d = {
        type_and_subgroup_url: l + '/topics/advanced-search?team_id=0&sort_id=0&orderby=',
        list_url:
          l +
          '/topics/list/page/1?keyword=${keyword}&sort_id=${type}&team_id=${subgroup}&order=date-desc',
      },
      h = '未能成功解析标题',
      p = -2,
      g = '未能成功解析类别',
      f = -1,
      y = '未知字幕组',
      m = 'magnet_not_found_未能成功解析磁力链接',
      b = '未能成功解析资源发布页面',
      w = '未能成功解析资源大小',
      _ = '1970-01-01 08:00:00',
      v = /<option value="(\d+)">(.+?)<\/option>/gim,
      I = /<option value="(\d+)" style="color: [\w#]+">(.+?)<\/option>/gim,
      S = {
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
      const t = new URL(encodeURI(e.url)).searchParams,
        n = t.get('type') || 0,
        a = t.get('subgroup') || 0,
        s = encodeURI(
          ((i = d.list_url),
          (u = { keyword: t.get('keyword'), type: n < 0 ? 0 : n, subgroup: a < 0 ? 0 : a }),
          i.replace(/\$\{(\w+)\}/gi, (e, t) => u[t])),
        )
      var i, u
      let v
      try {
        v = await c(s)
      } catch (e) {
        console.error(e)
      }
      return (function(e) {
        let t = { HasMore: null !== o(e, S.HasMore, []), Resources: [] }
        const n = o(e, S.Resources, [], 'all')
        if (null === n) return t
        return (
          n.forEach(e => {
            t.Resources.push(
              (function(e) {
                const t = o(e, S.Title, []),
                  n = o(e, S.TypeId, []),
                  a = o(e, S.TypeName, []),
                  s = o(e, S.SubgroupId, []),
                  i = o(e, S.SubgroupName, []),
                  u = o(e, S.Magnet, []),
                  c = o(e, S.PageUrl, []),
                  d = o(e, S.FileSize, []),
                  v = o(e, S.PublishDate, [])
                return {
                  Title: null === t ? h : t.trim().replace(S.TitleReplacer, '$1'),
                  TypeId: parseInt(n) || p,
                  TypeName: a || g,
                  SubgroupId: parseInt(s) || f,
                  SubgroupName: i || y,
                  Magnet: u || m,
                  PageUrl: null === c ? b : l + c,
                  FileSize: d || w,
                  PublishDate: null === v ? _ : r(v),
                }
              })(e),
            )
          }),
          t
        )
      })(v)
    }
    function x(e) {
      const t = e.replace(/&amp;/gi, '&')
      let n = o(t, v, ['Id', 'Name'], 'all')
      return null === n ? [] : (n.forEach(e => (e.Id = parseInt(e.Id))), n.shift(), n)
    }
    function R(e) {
      let t = o(e, I, ['Id', 'Name'], 'all')
      return null === t
        ? []
        : (t.forEach(e => (e.Id = parseInt(e.Id))), t.unshift({ Id: 0, Name: '全部' }), t)
    }
    const N = e => t => t.method.toLowerCase() === e.toLowerCase(),
      P = N('connect'),
      M = N('delete'),
      O = N('get'),
      j = N('head'),
      U = N('options'),
      L = N('patch'),
      k = N('post'),
      $ = N('put'),
      A = N('trace'),
      C = e => t => {
        const n = new URL(encodeURI(t.url)).pathname
        return (n.match(e) || [])[0] === n
      }
    var D = class {
        constructor() {
          this.routes = []
        }
        handle(e, t) {
          return this.routes.push({ conditions: e, handler: t }), this
        }
        connect(e, t) {
          return this.handle([P, C(e)], t)
        }
        delete(e, t) {
          return this.handle([M, C(e)], t)
        }
        get(e, t) {
          return this.handle([O, C(e)], t)
        }
        head(e, t) {
          return this.handle([j, C(e)], t)
        }
        options(e, t) {
          return this.handle([U, C(e)], t)
        }
        patch(e, t) {
          return this.handle([L, C(e)], t)
        }
        post(e, t) {
          return this.handle([k, C(e)], t)
        }
        put(e, t) {
          return this.handle([$, C(e)], t)
        }
        trace(e, t) {
          return this.handle([A, C(e)], t)
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
            t =>
              !(t.conditions && (!Array.isArray(t) || t.conditions.length)) ||
              ('function' == typeof t.conditions ? t.conditions(e) : t.conditions.every(t => t(e))),
          )
        }
      },
      E = n(0)
    async function z(e) {
      const t = new D()
      t.get('/subgroup', async () => {
        const e = await (async function() {
          let e
          try {
            e = await c(d.type_and_subgroup_url)
          } catch (e) {
            console.error(e)
          }
          return { Subgroups: x(e) }
        })()
        return new Response(JSON.stringify(e), s)
      }),
        t.get('/type', async () => {
          const e = await (async function() {
            let e
            try {
              e = await c(d.type_and_subgroup_url)
            } catch (e) {
              console.error(e)
            }
            return { Types: R(e) }
          })()
          return new Response(JSON.stringify(e), s)
        }),
        t.get('/list', async e => {
          const t = await T(e)
          return new Response(JSON.stringify(t), s)
        }),
        t.get(
          '/',
          async () =>
            new Response(
              await (async function() {
                let e
                try {
                  e = await c(
                    'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html',
                  )
                } catch (t) {
                  console.error(t),
                    (e = `\n<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width,initial-scale=1" />\n  <title>弹弹play资源搜索节点API - v${E.b}</title>\n</head>\n<body>\n  <h1>使用说明</h1>\n  <h2>GitHub - <a href="${E.a}">LussacZheng/dandanplay-resource-service</a></h2>\n</body>\n</html>\n`)
                }
                return e
              })(),
              i,
            ),
        )
      return await t.route(e)
    }
    addEventListener('fetch', e => e.respondWith(z(e.request)))
  },
])
