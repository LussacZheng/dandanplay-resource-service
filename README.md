# dandanplay-resource-service

![cfw-impl](https://img.shields.io/badge/impl-cfw-f1e05a?logo=cloudflare)
![deno-impl](https://img.shields.io/badge/impl-deno-000000?logo=deno)
![go-impl](https://img.shields.io/badge/impl-go-00add8?logo=go)
![rust-impl](https://img.shields.io/badge/impl-rust-dea584?logo=rust)

![GitHub release](https://img.shields.io/github/v/release/LussacZheng/dandanplay-resource-service?include_prereleases&label=version&color=important)
[![GitHub All Releases](https://img.shields.io/github/downloads/LussacZheng/dandanplay-resource-service/total?logo=github&color=green)](https://github.com/LussacZheng/dandanplay-resource-service/releases)
[![jsDelivr hits](https://img.shields.io/jsdelivr/gh/hm/LussacZheng/dandanplay-resource-service?color=red)](https://data.jsdelivr.com/v1/package/gh/LussacZheng/dandanplay-resource-service@dist/stats/file)

API implementations for "dandanplay" resource search service.  
[弹弹play](http://www.dandanplay.com/) 资源搜索节点的 API 实现。

提供分别基于 [**Cloudflare Workers**](#cloudflare-workers), [**Deno Deploy**](#deno-deploy), [**Golang**](#golang) 和 [**Rust**](#rust) 的四种实现。

## 特性

- Serverless 优先，也支持在本地或服务器运行
- 支持 [搜索指令](docs) : `$realtime` , `$page` , `$limit`
- 部署或运行后，访问根路径可以看到简易的测试页面

---

## Cloudflare Workers

> 注册一个 Cloudflare 免费账户即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
>
> - 可在搜索引擎中搜索 "`Cloudflare Workers部署教程`" ，参照进行。
> - 由于暂未实现 [缓存机制](https://developers.cloudflare.com/workers/runtime-apis/cache) ，且 Cloudflare Workers 免费版账户有每日 100,000 的请求次数限制，目前暂不提供演示站点。可以自行部署体验。

复制 [`worker.js`](https://github.com/LussacZheng/dandanplay-resource-service/blob/dist/cf-worker/worker.js) 内容到 [workers.dev 脚本编辑页面](https://workers.cloudflare.com/) 中，部署即可。

## Deno Deploy

> 使用 GitHub 账户登录注册 [Deno Deploy](https://deno.com/deploy) 即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
>
> - "New Project" -> "Play" -> "Playground" -> Paste code -> "Save & Deploy"
> - 由于 Deno Deploy 目前仍为 [Beta](https://deno.com/blog?tag=deno-deploy) 平台，[风险和稳定性未知](https://deno.com/deploy/docs/fair-use-policy)，且免费版账户有每日 100,000 的[请求次数限制](https://deno.com/deploy/docs/pricing-and-limits)，目前暂不提供演示站点。可以自行部署体验。

复制 [`playground.js`](https://github.com/LussacZheng/dandanplay-resource-service/blob/dist/deno-deploy/playground.js) 内容到 [Deno Playground 脚本编辑页面](https://dash.deno.com/projects) 中，部署即可。

## Golang

从 [Releases 页面](https://github.com/LussacZheng/dandanplay-resource-service/releases) 下载预编译的可执行文件到 本地 或 服务器 ，（重命名后）运行即可。

```shell
# 详细说明另见 `golang` 文件夹
$ dandanplay-resource-service -h

# 无参数，默认运行在 localhost:8080
$ dandanplay-resource-service

# 自定义端口 和 代理地址(可省略 "http://")
$ dandanplay-resource-service -P 9000 -x 127.0.0.1:10809

# 运行在 34543 端口并暴露服务到公网
$ dandanplay-resource-service -H 0.0.0.0 -P 34543
```

## Rust

目前 Rust 版的功能、使用方法与 Golang 版基本一致，主要差异如下表所示。

|    比较项目    | Rust  | Golang |
| :------------: | :---: | :----: |
| 可执行文件大小 |   ✔️   |        |
|    内存占用    |   ✔️   |        |
|    静态编译    |   ✔️   |   ✔️    |
|    编译速度    |       |   ✔️    |
|    交叉编译    |       |   ✔️    |

---

## 开发

了解如何**在本地或服务器运行**，或开发相关，详见各自实现所在的文件夹。

- [TypeScript](typescript/README.md) _(Cloudflare Workers, Deno Deploy)_
- [Golang](golang/README.md)
- [Rust](rust/README.md)

### 相关项目

- [Python](python/README.md)
- PHP: [lianxun/dandan - Gitee](https://gitee.com/lianxun/dandan)

### 参考资料

1. **API Specification** - [弹弹play资源搜索节点API规范](https://github.com/kaedei/dandanplay-libraryindex/blob/master/api/ResourceService.md)
2. [关于“资源搜索”功能即将下线的通知](https://mp.weixin.qq.com/s/0xzIJX2LWnncc2YKpe6sfw)
3. [资源搜索相关问题的解答](https://mp.weixin.qq.com/s/OSsk6tuj4lXMcKq2S4s1Kg)

### TODO

- [ ] 添加 Dockerfile
- [ ] 引入缓存机制

## Contributing

Issues, pull requests, and discussions are always welcome.

## License

This project is licensed under the [Apache-2.0 License](./LICENSE).
