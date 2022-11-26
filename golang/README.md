# dandanplay-resource-service: _go-impl_

此目录中包含 dandanplay-resource-service 的 [Golang](https://go.dev/) 相关实现，并支持：

- 本地或服务器以 独立可执行文件 运行
- 部署到 `XXX` _(TODO)_

## 运行

```shell
$ dandanplay-resource-service -h
API implementation for 'dandanplay' resource search service, in Golang.

Usage:
  dandanplay-resource-service [flags]

Flags:
      --debug          以调试模式运行，运行时输出更多信息
      --dry-run        阻止网络访问并返回空数据，用于开发调试
  -h, --help           输出帮助信息
  -H, --host string    API 监听的 IP 地址，例如 "0.0.0.0", "127.0.0.1", "192.168.0.100" (默认为 "localhost")
  -P, --port string    API 监听的端口 (默认为 "8080")
  -x, --proxy string   网页解析器所使用的代理地址，支持 "http" 和 "socks5" 协议
  -V, --version        输出版本信息
```

例如：

```shell
# 无参数，默认运行在 localhost:8080
$ dandanplay-resource-service

# 自定义端口 和 代理地址(可省略 "http://")
$ dandanplay-resource-service -P 9000 -x 127.0.0.1:10809

# 运行在 34543 端口并暴露服务到公网
$ dandanplay-resource-service -H 0.0.0.0 -P 34543
```

## 开发

若需修改源码，则需要准备相关开发环境

- [Git](https://git-scm.com/)
- [Go](https://golang.google.cn/dl/) v1.15+

  ```shell
  # 如有必要，可以先设置 GOPROXY
  $ go env -w GO111MODULE=on
  $ go env -w GOPROXY=https://goproxy.cn,direct
  ```

拉取源码

```shell
git clone https://github.com/LussacZheng/dandanplay-resource-service.git
cd dandanplay-resource-service/golang
```

修改源码并尝试运行

```shell
# 运行
$ go run main.go

# 测试
$ go test ./...

# 直接编译
$ go build

# 优化可执行文件大小
$ go build -ldflags="-s -w"

# 使用 UPX 进一步压缩
$ upx --lzma --best dandanplay-resource-service*
```

## 其他

- 除了通过 `-x, --proxy` 参数指定代理地址外，通过环境变量 `HTTP_PROXY` 或 `HTTPS_PROXY` 设置的代理均有效。

## TODO

- [ ] `json.Marshal()` 默认会对返回结果中的[特殊字符进行转义](https://github.com/gin-gonic/gin/issues/693)，例如磁链中的 `&` 会被转义为 `\u0026`
- [ ] 调整目录与模块结构，与 Rust 实现保持一致
- [ ] 完善 KissSub 相关网页的 [解析](./api/kisssub/README.md#known-issues)
- [ ] 添加更多的信息源/发布站
