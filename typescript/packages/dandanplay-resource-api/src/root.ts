import { template } from 'utils'
import request from 'utils/request'

const ASSET =
  'https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/web/index.html'

const DEFAULT = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>弹弹play资源搜索节点API - v\${VERSION}</title>
</head>
<body>
  <h1>使用说明</h1>
  <h2>GitHub - <a href="\${HOMEPAGE}">LussacZheng/dandanplay-resource-service</a></h2>
</body>
</html>
`

export async function fetchIndex(
  version: string,
  homepage: string,
  impl: string = 'ts-impl',
): Promise<string> {
  try {
    const html = await request(ASSET)
    return template(html, { VERSION: version, IMPL: impl })
  } catch (err) {
    console.error(err)
    return template(DEFAULT, { VERSION: version, HOMEPAGE: homepage })
  }
}
