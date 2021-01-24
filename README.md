# dandanplay-resource-service

API implementations for "dandanplay" resource search service.  
[弹弹play](http://www.dandanplay.com/) 资源搜索节点 API 实现。

## Cloudflare Workers

由于暂未实现 [缓存机制](https://developers.cloudflare.com/workers/runtime-apis/cache) ，且 Cloudflare Workers 免费版账户有每日 100,000 的请求次数限制，目前暂不提供演示站点。可以自行部署体验。

### 部署

> - 注册一个 Cloudflare 免费账户即可部署，**无需 远程服务器 或 常驻任何本地程序** 。
> - 可在搜索引擎中搜索 "`Cloudflare Workers部署教程`" ，参照进行。

复制 [`worker.js`](https://pastebin.ubuntu.com/p/7Zvtzxxhc9/) 内容到 [workers.dev 脚本编辑页面](https://workers.cloudflare.com/) 中，部署即可。

### 开发

若需修改源码，可以依照以下步骤自行生成 `worker.js` :

1. 安装 [wrangler](https://github.com/cloudflare/wrangler) 。
   > 若为 Windows 系统，建议选择 [二进制文件安装](https://developers.cloudflare.com/workers/cli-wrangler/install-update#manual-install) 。

2. 修改源码并重新构建：

   ```shell
   $ git clone https://github.com/LussacZheng/dandanplay-resource-service.git
   $ cd dandanplay-resource-service/cf-worker

   # 按需修改源码

   $ wrangler build
   # or
   $ npm run build
   ```

3. 输出文件位于 `cf-worker/dist/worker.js` 。

## Golang

..._todo_...

---

## 相关项目

### Python & PHP

- https://pastebin.ubuntu.com/p/mGP7JRpBtd/
- [lianxun/dandan - Gitee](https://gitee.com/lianxun/dandan)
- https://support.qq.com/products/104929/post/161035286010443896/

## 参考资料

1. **API Specification** - [弹弹play资源搜索节点API规范](https://github.com/kaedei/dandanplay-libraryindex/blob/master/api/ResourceService.md)
2. [关于“资源搜索”功能即将下线的通知](https://mp.weixin.qq.com/s/0xzIJX2LWnncc2YKpe6sfw)
3. [资源搜索相关问题的解答](https://mp.weixin.qq.com/s/OSsk6tuj4lXMcKq2S4s1Kg)
