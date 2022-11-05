/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import {
  fetchIndex,
  generateList,
  generateMetaInfo,
  generateSubgroup,
  generateType,
  ResInitHtml,
  ResInitJson,
} from 'dandanplay-resource-api'
import { Router } from 'itty-router'

import { name, version, homepage } from '../package.json'
import { description } from './package.json'

const router = Router()

router.get('/subgroup', async () => {
  const data = await generateSubgroup()
  return new Response(JSON.stringify(data), ResInitJson)
})
router.get('/type', async () => {
  const data = await generateType()
  return new Response(JSON.stringify(data), ResInitJson)
})
router.get('/list', async req => {
  const data = await generateList(req.url)
  return new Response(JSON.stringify(data), ResInitJson)
})

// return an index page for the root route
router.get('/', async () => new Response(await fetchIndex(version, homepage), ResInitHtml))

// return meta info about this API self
router.get('/self', () => {
  return new Response(
    JSON.stringify(
      generateMetaInfo({
        name,
        version,
        homepage,
        description,
        platform: 'cf-worker',
        tool: 'wrangler',
      }),
    ),
    ResInitJson,
  )
})

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }))

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
}

export default {
  // async fetch(req: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
  //   return new Response('Hello World!')
  // },
  fetch: router.handle,
}
