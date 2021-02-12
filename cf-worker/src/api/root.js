'use strict'

import { template } from '../utils/helper'
import { get } from '../utils/request'
import { version, homepage } from '../../package.json'

const ASSET =
  'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html'

const DEFAULT = `
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

/**
 * @async
 */
export async function fetchIndex() {
  let html
  try {
    html = await get(ASSET)
    html = template(html, { VERSION: version })
  } catch (e) {
    console.error(e)
    html = DEFAULT
  }
  return html
}
