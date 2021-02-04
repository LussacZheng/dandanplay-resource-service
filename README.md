# dandanplay-resource-service._dist_

![version](https://img.shields.io/badge/version-0.0.1-important)

[弹弹play](http://www.dandanplay.com/) 资源搜索节点的 API 实现，基于 Cloudflare Workers 。

> 由于 GitHub Gist 难以访问，使用此分支管理、发布 [`worker.js`](cf-worker/worker.js) ，避免影响主分支的提交历史。  
> 同时还可以使用 jsDelivr CDN 。

## Cloudflare Workers

### 部署

> - 注册一个 Cloudflare 免费账户即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
> - 可在搜索引擎中搜索 "`Cloudflare Workers部署教程`" ，参照进行。

复制 [`worker.js`](https://cdn.jsdelivr.net/gh/LussacZheng/dandanplay-resource-service@dist/cf-worker/worker.js) 内容到 [workers.dev 脚本编辑页面](https://workers.cloudflare.com/) 中，部署即可。

详细信息另见 [main 分支](https://github.com/LussacZheng/dandanplay-resource-service) 。

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).
