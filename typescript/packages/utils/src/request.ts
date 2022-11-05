export const ResInitJson: ResponseInit = {
  headers: {
    'content-type': 'application/json;charset=utf-8',
  },
} as const

export const ResInitHtml: ResponseInit = {
  headers: {
    'content-type': 'text/html;charset=utf-8',
  },
} as const

export const ResInitText: ResponseInit = {
  headers: {
    'content-type': 'text/plain;charset=utf-8',
  },
} as const

export const ReqInitJson: RequestInit = {
  headers: {
    accept: 'application/json;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
} as const

export const ReqInitHtml: RequestInit = {
  headers: {
    accept: 'text/html;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
} as const

/**
 * Send a `GET` request and receive the response body as a `string` or `JSON` object.
 */
export default async function get(
  url: string,
  init: RequestInit = ReqInitHtml,
): Promise<string | any> {
  let res: Response
  try {
    res = await fetch(decodeURI(url), init)
  } catch (e) {
    console.error(e)
    res = new Response(`ERROR: ${e}`)
  }
  return await gatherResponse(res)
}

/**
 * Awaits and returns a response body as a `string` or `JSON` object.
 */
async function gatherResponse(response: Response): Promise<string | any> {
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
