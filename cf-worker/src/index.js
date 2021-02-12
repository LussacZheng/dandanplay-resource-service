'use strict'

import { generateSubgroup, generateType, generateList } from './api/dmhy'
import { fetchIndex } from './api/root'
import { ResInitHtml, ResInitJson } from './config/config'
import Router from './router'

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
