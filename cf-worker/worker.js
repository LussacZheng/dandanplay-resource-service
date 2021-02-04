// https://github.com/LussacZheng/dandanplay-resource-service

!(function(e) {
  var t = {}
  function n(r) {
    if (t[r]) return t[r].exports
    var o = (t[r] = { i: r, l: !1, exports: {} })
    return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports
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
        for (var o in e)
          n.d(
            r,
            o,
            function(t) {
              return e[t]
            }.bind(null, o),
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
    e.exports = { a: 'https://github.com/LussacZheng/dandanplay-resource-service' }
  },
  function(e, t, n) {
    'use strict'
    function r(e, t) {
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
    var o = function(e, t, n, o = 'first') {
      switch (o) {
        case 'all':
          return (function(e, t, n) {
            const o = e.matchAll(t),
              s = Array.from(o, e => r(e, n))
            return 0 === s.length ? null : s
          })(e, t, n)
        case 'last':
          return (function(e, t, n) {
            const o = [...e.matchAll(t)],
              s = o[o.length - 1]
            return 0 === o.length ? null : r(s, n)
          })(e, t, n)
        default:
          return (function(e, t, n) {
            let o = t.exec(e)
            return (t.lastIndex = 0), null === o ? null : r(o, n)
          })(e, t, n)
      }
    }
    const s = { headers: { 'content-type': 'application/json;charset=utf-8' } },
      a = {
        headers: {
          accept: 'text/html;charset=utf-8',
          'user-agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
        },
      }
    async function i(e, t = a) {
      const n = await fetch(decodeURI(e), t)
      return await (async function(e) {
        const { headers: t } = e,
          n = t.get('content-type')
        return n.includes('application/json')
          ? await e.json()
          : (n.includes('application/text') || n.includes('text/html'), await e.text())
      })(n)
    }
    const u = 'https://share.dmhy.org',
      c = {
        type_and_subgroup_url: u + '/topics/advanced-search?team_id=0&sort_id=0&orderby=',
        list_url:
          u +
          '/topics/list/page/1?keyword=${keyword}&sort_id=${type}&team_id=${subgroup}&order=date-desc',
        unknown_subgroup_id: -1,
        unknown_subgroup_name: '未知字幕组',
      },
      l = /<option value="(\d+)">(.+?)<\/option>/gim,
      d = /<option value="(\d+)" style="color: [\w#]+">(.+?)<\/option>/gim,
      p = {
        HasMore: /下一頁/g,
        Resources: /<tr class="">(.*?)<\/tr>/gis,
        TypeId: /href="\/topics\/list\/sort_id\/(\d+)"/gim,
        TypeName: /<font color=\w+>(.+)<\/font>/gim,
        SubgroupId: /href="\/topics\/list\/team_id\/(\d+)"/gim,
        SubgroupName: /\s+(.*)<\/a><\/span>/gim,
        Magnet: /href="(magnet:\?xt=urn:btih:.+?)"/gim,
        PageUrl: /href="(.+?)"\s*target="_blank"/gim,
        FileSize: /<td.*>([\w\.]+B)<\/td>/gim,
        PublishDate: /<span style="display: none;">([\d\/ :]+)<\/span>/gim,
        Title: /target="_blank" ?>(.+?)<\/a>/gis,
        TitleReplacer: /<span class="keyword">(.*?)<\/span>/gi,
      }
    async function h(e) {
      const t = new URL(e.url).searchParams,
        n = encodeURI(
          ((r = c.list_url),
          (s = {
            keyword: t.get('keyword'),
            type: t.get('type') || 0,
            subgroup: t.get('subgroup') || 0,
          }),
          r.replace(/\$\{(\w+)\}/gi, (e, t) => s[t])),
        )
      var r, s
      let a
      try {
        a = await i(n)
      } catch (e) {
        console.error(e)
      }
      return (function(e) {
        let t = { HasMore: null !== o(e, p.HasMore, []), Resources: [] }
        return (
          o(e, p.Resources, [], 'all').forEach(e => {
            t.Resources.push(
              (function(e) {
                const t = o(e, p.Title, []),
                  n = o(e, p.TypeId, []),
                  r = o(e, p.TypeName, []),
                  s = o(e, p.SubgroupId, []) || c.unknown_subgroup_id,
                  a = o(e, p.SubgroupName, []) || c.unknown_subgroup_name,
                  i = o(e, p.Magnet, []),
                  l = u + o(e, p.PageUrl, []),
                  d = o(e, p.FileSize, []),
                  h = (function(e) {
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
                  })(o(e, p.PublishDate, []))
                return {
                  Title: t.trim().replace(p.TitleReplacer, '$1'),
                  TypeId: parseInt(n),
                  TypeName: r,
                  SubgroupId: parseInt(s),
                  SubgroupName: a,
                  Magnet: i,
                  PageUrl: l,
                  FileSize: d,
                  PublishDate: h,
                }
              })(e),
            )
          }),
          t
        )
      })(a)
    }
    function g(e) {
      const t = e.replace(/&amp;/gi, '&')
      let n = o(t, l, ['Id', 'Name'], 'all')
      return n.forEach(e => (e.Id = parseInt(e.Id))), n.shift(), n
    }
    function f(e) {
      let t = o(e, d, ['Id', 'Name'], 'all')
      return t.forEach(e => (e.Id = parseInt(e.Id))), t.unshift({ Id: 0, Name: '全部' }), t
    }
    const y = e => t => t.method.toLowerCase() === e.toLowerCase(),
      m = y('connect'),
      b = y('delete'),
      w = y('get'),
      _ = y('head'),
      I = y('options'),
      S = y('patch'),
      v = y('post'),
      T = y('put'),
      x = y('trace'),
      R = e => t => {
        const n = new URL(t.url).pathname
        return (n.match(e) || [])[0] === n
      }
    var N = class {
        constructor() {
          this.routes = []
        }
        handle(e, t) {
          return this.routes.push({ conditions: e, handler: t }), this
        }
        connect(e, t) {
          return this.handle([m, R(e)], t)
        }
        delete(e, t) {
          return this.handle([b, R(e)], t)
        }
        get(e, t) {
          return this.handle([w, R(e)], t)
        }
        head(e, t) {
          return this.handle([_, R(e)], t)
        }
        options(e, t) {
          return this.handle([I, R(e)], t)
        }
        patch(e, t) {
          return this.handle([S, R(e)], t)
        }
        post(e, t) {
          return this.handle([v, R(e)], t)
        }
        put(e, t) {
          return this.handle([T, R(e)], t)
        }
        trace(e, t) {
          return this.handle([x, R(e)], t)
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
      k = n(0)
    async function M(e) {
      const t = new N()
      t.get('/subgroup', async () => {
        const e = await (async function() {
          let e
          try {
            e = await i(c.type_and_subgroup_url)
          } catch (e) {
            console.error(e)
          }
          return { Subgroups: g(e) }
        })()
        return new Response(JSON.stringify(e), s)
      }),
        t.get('/type', async () => {
          const e = await (async function() {
            let e
            try {
              e = await i(c.type_and_subgroup_url)
            } catch (e) {
              console.error(e)
            }
            return { Types: f(e) }
          })()
          return new Response(JSON.stringify(e), s)
        }),
        t.get('/list', async e => {
          const t = await h(e)
          return new Response(JSON.stringify(t), s)
        }),
        t.get('/', () => new Response('使用说明：' + k.a))
      return await t.route(e)
    }
    addEventListener('fetch', e => e.respondWith(M(e.request)))
  },
])
