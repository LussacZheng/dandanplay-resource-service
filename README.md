# dandanplay-resource-service._dist_

![cfw impl version](https://img.shields.io/badge/cfw--impl-v0.0.5--alpha-f1e05a?logo=cloudflare)
![deno impl version](https://img.shields.io/badge/deno--impl-v0.0.5--alpha-000000?logo=deno)
![go impl version](https://img.shields.io/badge/go--impl-v0.0.5--alpha-00add8?logo=go)
[![jsDelivr hits](https://img.shields.io/jsdelivr/gh/hm/LussacZheng/dandanplay-resource-service?color=red)](https://data.jsdelivr.com/v1/package/gh/LussacZheng/dandanplay-resource-service@dist/stats/file)

[弹弹play](http://www.dandanplay.com/) 资源搜索节点的 API 实现，基于 Cloudflare Workers 或 Deno Deploy ，使用 TypeScript 语言。

> 由于 GitHub Gist 难以访问，使用此分支管理、发布 `worker.js / playground.js` ，避免影响主分支的提交历史。  
> 同时还可以使用 jsDelivr CDN 。

## Cloudflare Workers

> 注册一个 Cloudflare 免费账户即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
>
> - 可在搜索引擎中搜索 "`Cloudflare Workers部署教程`" ，参照进行。
> - 注意：Cloudflare Workers 免费版账户有每日 100,000 的请求次数限制，

复制 [`worker.js`](./cf-worker/worker.js) 内容到 [workers.dev 脚本编辑页面](https://workers.cloudflare.com/) 中，部署即可。

## Deno Deploy

> 使用 GitHub 账户登录注册 [Deno Deploy](https://deno.com/deploy) 即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
>
> - "New Project" -> "Play" -> "Playground" -> Paste code -> "Save & Deploy"
> - 注意：Deno Deploy 仍为[Beta](https://deno.com/blog?tag=deno-deploy)平台，[风险和稳定性未知](https://deno.com/deploy/docs/fair-use-policy)，且免费版账户有每日 100,000 的[请求次数限制](https://deno.com/deploy/docs/pricing-and-limits)。

复制 [`playground.js`](./deno-deploy/playground.js) 内容到 [Deno Playground 脚本编辑页面](https://dash.deno.com/projects) 中，部署即可。

## 详细信息

另见 [main 分支](https://github.com/LussacZheng/dandanplay-resource-service) 。

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).
