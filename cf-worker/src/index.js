'use strict'

import { generateSubgroup, generateType, generateList } from './api/dmhy'
import { ResInitHtml, ResInitJson } from './config/config'
import Router from './router'
import { get } from './utils/request'
import { version, homepage } from '../package.json'

/**
 * @param {Request} request
 */
async function handleRequest(request) {
  // https://github.com/cloudflare/worker-template-router/blob/master/index.js
  const r = new Router()

  r.get('/subgroup', async () => {
    const data = await generateSubgroup()
    return new Response(JSON.stringify(data), ResInitJson)
  })
  r.get('/type', async () => {
    const data = await generateType()
    return new Response(JSON.stringify(data), ResInitJson)
  })
  r.get('/list', async request => {
    const data = await generateList(request)
    return new Response(JSON.stringify(data), ResInitJson)
  })

  // return an index page for the root route
  r.get('/', async () => {
    return new Response(await fetchIndex(), ResInitHtml)
  })

  const resp = await r.route(request)
  return resp
}

addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})

async function fetchIndex() {
  let html
  try {
    html = await get('https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html')
  } catch (e) {
    console.error(e)
    html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>弹弹play资源搜索节点API - v${version}</title>
</head>
<body>
  <h1>使用说明</h1>
  <h2>GitHub - <a href="${homepage}">LussacZheng/dandanplay-resource-service</a></h2>
</body>
</html>
`
  }
  return html
}
