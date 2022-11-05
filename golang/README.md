# dandanplay-resource-service: _go-impl_

此目录中包含 dandanplay-resource-service 的 [Golang](https://www.typescriptlang.org/) 相关实现，并支持：

- 本地或服务器以 独立可执行文件 运行
- 部署到 `XXX` _(TODO)_

## 开发

若需修改源码或自行编译，则需要 [Go 语言](https://go.dev/) 开发环境。

```shell
$ git clone https://github.com/LussacZheng/dandanplay-resource-service.git
$ cd dandanplay-resource-service/golang

# go env -w GO111MODULE=on
# go env -w GOPROXY=https://goproxy.cn,direct

# 直接编译
$ go build

# 优化可执行文件大小
$ go build -ldflags="-s -w"
$ upx --lzma --best dandanplay-resource-service*
```
