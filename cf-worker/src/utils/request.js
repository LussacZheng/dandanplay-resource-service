'use strict'

import { ReqInitHtml } from '../config/config'

/**
 * @param {String} url
 * @param {RequestInit} init
 */
export async function get(url, init = ReqInitHtml) {
  let res
  try {
    res = await fetch(decodeURI(url), init)
  } catch (e) {
    console.error(e)
  }
  return await gatherResponse(res)
}

/**
 * gatherResponse awaits and returns a response body as a string.
 * Use await gatherResponse(..) in an async function to get the response body
 * @param {Response} response
 */
export async function gatherResponse(response) {
  const { headers } = response
  const contentType = headers.get('content-type')
  if (contentType.includes('application/json')) {
    return await response.json()
  } else if (contentType.includes('application/text')) {
    return await response.text()
  } else if (contentType.includes('text/html')) {
    return await response.text()
  } else {
    return await response.text()
  }
}
