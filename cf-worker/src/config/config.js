'use strict'

// NEVER overwrite the value of these constants !!!
// They are READ-ONLY !!!

/**
 * @readonly
 * @type {ResponseInit}
 */
export const ResInitJson = {
  headers: {
    'content-type': 'application/json;charset=utf-8',
  },
}

/**
 * @readonly
 * @type {ResponseInit}
 */
export const ResInitText = {
  headers: {
    'content-type': 'text/plain;charset=utf-8',
  },
}

/**
 * @readonly
 * @type {RequestInit}
 */
export const ReqInitJson = {
  headers: {
    accept: 'application/json;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
}

/**
 * @readonly
 * @type {RequestInit}
 */
export const ReqInitHtml = {
  headers: {
    accept: 'text/html;charset=utf-8',
    'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
  },
}
