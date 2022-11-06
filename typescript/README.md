# dandanplay-resource-service: _ts-impl_

此目录中包含 dandanplay-resource-service 的 [TypeScript](https://www.typescriptlang.org/) 相关实现，并支持：

- 部署到 Cloudflare Workers
- 部署到 Deno Deploy
- 本地或服务器以 Node.js 运行
- 本地或服务器以 Deno 运行

## Setup

若需修改源码，则需要准备相关开发环境

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) v16.13+
  _(via [nvm](https://github.com/nvm-sh/nvm) / [nvm4w](https://github.com/coreybutler/nvm-windows) / [fnm](https://github.com/Schniz/fnm) / [volta](https://github.com/volta-cli/volta))_
- [pnpm](https://pnpm.io/)
  _(via `corepack enable`)_
- [Deno](https://deno.land/) v1.27+
  _(optional)_

拉取源码并安装依赖

```shell
git clone https://github.com/LussacZheng/dandanplay-resource-service.git
cd dandanplay-resource-service/typescript
pnpm i
```

## [Cloudflare Workers](https://workers.cloudflare.com/)

> `cd cf-worker`

### 开发

1. 启动开发服务器

   ```shell
   pnpm run dev
   ```

2. 修改该文件夹内代码，浏览器访问 [localhost:8787](http://localhost:8787) 以观察效果。
3. 但若需修改 `packages/` 下的代码，则需要退出开发服务器并重新运行上述命令。

### 部署到 Cloudflare Workers

- 普通构建

  ```shell
  pnpm run build
  ```

  输出文件位于 `./cf-worker/dist/main.js` 。

- 发布构建

  ```shell
  pnpm run dist
  ```

  输出文件位于 `./dist/worker_*.js` 。

复制上述构建产物 `worker.js` 内容到 [workers.dev 脚本编辑页面](https://workers.cloudflare.com/) 中，部署即可。

### 本地或服务器以 Node.js 运行

- 通过 [Miniflare](https://miniflare.dev/) 再利用上述构建产物，直接运行

  ```shell
  pnpx miniflare --modules /path/to/worker.js
  ```

- 或自行编写 HTTP 服务器，并引用 [`dandanplay-resource-api`](./packages/dandanplay-resource-api/src/index.ts) 作为依赖，参考 [`cf-worker`](./cf-worker/main.ts) ，只需定义路由并监听 Request 即可。_(HINT: Express, Koa, Vanilla Node, etc.)_

## [Deno Deploy](https://deno.com/deploy)

> `cd deno-deploy` 并用 vscode 以独立窗口打开该文件夹。

### 开发

1. 启动开发服务器

   ```shell
   deno task dev
   ```

2. 修改该文件夹内代码，浏览器访问 [localhost:8000](http://localhost:8000) 以观察效果。
3. 但若需修改 `packages/` 下的代码，则需要退出开发服务器并重新运行上述命令。

### 部署到 Deno Deploy

- 普通构建

  ```shell
  deno task build
  ```

  输出文件位于 `./deno-deploy/dist/main.js` ，但还需要额外将该文件中的 `\"` 全部删除或替换为 `'` [才能正常运行](https://github.com/denoland/deno/issues/14012)。

- 发布构建

  ```shell
  deno task dist
  ```

  输出文件位于 `./dist/playground_*.js` 。

复制上述构建产物 `playground.js` 内容到 [Deno Playground 脚本编辑页面](https://dash.deno.com/projects) 中，部署即可。

### 本地或服务器以 Deno 运行

- 以项目整体形式运行

  ```shell
  deno task start
  ```

- 或先构建再以单文件形式运行

  ```shell
  deno run --allow-net /path/to/playground.js
  ```

- 或打包为 独立可执行文件 再运行

  > 注意，如果需要独立可执行文件 (standalone executable)，更建议使用 [Go 实现](../golang/README.md)，此处只是提供一种可行性。
  >
  > 此外，打包时的 Warning [可忽略](https://github.com/denoland/deno/issues/14246)。

  ```shell
  deno task compile
  ```

---

## Contributing Guide

### Install dependencies

```shell
pnpm -w i -r
```

### Build and distribute all

You can build `worker.js` (for Cloudflare Workers) and `playground.js` (for Deno Deploy) with a single command:

```shell
pnpm -w run dist:all
```

Find the built artifacts under `./.dist/`.

### Project Structure

Both `cfw-impl` and `deno-impl` are **simple wrappers** of `packages/dandanplay-resource-api`,
with additional HTTP servers _(Request handler and router)_.

```text
.
|-- cf-worker/
|   |-- dist.ts                     # bundle script
|   |-- main.ts                     # entrypoint of `cfw-impl`
|   `-- ...
|-- deno-deploy/
|   |-- dist.ts                     # bundle script
|   |-- main.ts                     # entrypoint of `deno-impl`
|   |-- routes.ts                   # part of `./main.ts`
|   `-- ...
|-- packages/
|   |-- dandanplay-resource-api/    # **core implementation codes**
|   `-- utils/                      # utils for both main and dist script
|-- README.md                       # the document you are reading now  <--
|-- pnpm-workspace.yaml             # `pnpm` workspace definition
|-- tsconfig.base.json              # common config for `tsc`
|-- vitest.config.ts                # common config for `vitest`
`-- ...
```

### Modify Packages

Whenever you edit the source codes under `./packages/*`, you will need to recompile/rebuild the library files.

```shell
# While in `packages/{library}/` dir itself, you can rebuild this library via
$ pnpm run build

# or rebuild all libraries inside `packages/`
$ pnpm -w run sync-deps
```

You should also write unit tests for your code.

```shell
# While in `packages/{library}/` dir, you can test this library
$ pnpm run test

# or test all the libraries
$ pnpm -w run test
```

Likewise, get code coverage report under `./.coverage/`:

```shell
pnpm -w run coverage
```

And remember to format codes before committing:

```shell
pnpm -w run format
```

### Notes on NPM scripts

- For all the commands mentioned above related to `pnpm run`, you can omit the `run`.
  For example, `pnpm -w run test` is [equivalent](https://pnpm.io/pnpm-cli#commands) to `pnpm -w test`.

- Highlight/list the important or frequently used [npm scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts) defined in the `package.json` of this project/sub-package:

  ```shell
  pnpm run list
  ```
