/**
 * The reason for stripping this file from the `main.ts`:
 * When running `deno bundle`, bundle this script without including
 * remote codes (such as `std/http/server.ts` or `x/rutt/mod.ts`)
 */

import { Routes } from 'https://deno.land/x/rutt@0.0.14/mod.ts';

import pkg from '../package.json' assert { type: 'json' };
const { name, version, homepage } = pkg;

import {
  fetchIndex,
  generateList,
  generateMetaInfo,
  generateSubgroup,
  generateType,
  ResInitHtml,
  ResInitJson,
} from '../packages/dandanplay-resource-api/dist/index.js';

const description =
  'API implementation for \'dandanplay\' resource search service, based on TypeScript and Deno Deploy.';

export const routes: Routes = {
  'GET@/subgroup': async () => {
    const data = await generateSubgroup();
    return new Response(JSON.stringify(data), ResInitJson);
  },
  'GET@/type': async () => {
    const data = await generateType();
    return new Response(JSON.stringify(data), ResInitJson);
  },
  'GET@/list': async (req) => {
    const data = await generateList(req.url);
    return new Response(JSON.stringify(data), ResInitJson);
  },

  // return an index page for the root route
  '/': async () => new Response(await fetchIndex(version, homepage, 'deno-impl'), ResInitHtml),

  // return meta info about this API self
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
    );
  },

  // 404 for everything else
  '*': () => new Response('Not Found.', { status: 404 }),
};
