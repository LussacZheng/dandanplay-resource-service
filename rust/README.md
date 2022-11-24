# dandanplay-resource-service: _rust-impl_

此目录中包含 dandanplay-resource-service 的 [Rust](https://www.rust-lang.org/) 相关实现，并支持：

- 本地或服务器以 独立可执行文件 运行
- 部署到 `XXX` _(TODO)_

## 运行

```shell
$ dandanplay-resource-service -h
API implementation for 'dandanplay' resource search service, in Rust.

Usage: dandanplay-resource-service [OPTIONS]

Options:
  -H, --host <HOST>    API 监听的 IP 地址，例如 "0.0.0.0", "127.0.0.1", "192.168.0.100" (默认为 "localhost")
  -P, --port <PORT>    API 监听的端口 (默认为 "8080")
  -x, --proxy <PROXY>  网页解析器所使用的代理地址，支持 "http" 和 "socks5" 协议
  -v, --verbose...     以调试模式运行 (使用 `-vv` 以在运行时输出更多信息)
  -h, --help           输出帮助信息 (使用 `--help` 以获取更详细的帮助信息)
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
- Rust & Cargo v1.63+
  _(via [Rustup](https://www.rust-lang.org/zh-CN/tools/install))_

  ```toml
  # 如有必要，可以先替换 crates.io 源 (`~/.cargo/config`)
  [source.crates-io]
  replace-with = 'tuna'

  [source.tuna]
  registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
  ```

拉取源码

```shell
git clone https://github.com/LussacZheng/dandanplay-resource-service.git
cd dandanplay-resource-service/rust
```

修改源码并尝试运行

```shell
# 运行
$ cargo run
$ cargo run -- -h

# 测试
$ cargo test

# 编译
$ cargo build --release
```

## Features

Cargo 提供了 [`features` 机制](https://doc.rust-lang.org/cargo/reference/features.html) 来进行条件编译，所有可选的 features 可以在 [`Cargo.toml`](./Cargo.toml) 的 `[features]` 表中找到。

本项目提供了若干个可选 features ，你可以在运行或编译时通过 `--all-features`, `-F, --features <FEATURES>`, `--no-default-features` 等参数进行选择。
例如

- 默认为启用大部分 `features`

  ```shell
  cargo run
  cargo build --release
  ```

- 如果你不需要 "[搜索指令 (SearchOptions)](../docs/SearchOptions.md)"

  ```shell
  cargo run --no-default-features -F basic
  cargo build --release --no-default-features -F basic
  ```

- 如果你需要在使用搜索指令 [`$realtime`](../docs/SearchOptions.md#realtime) 时，令关键字的比较忽略简繁体字的差异

  ```shell
  cargo run -F search-option-t2s
  cargo build --release -F search-option-t2s
  ```

- 如果你只想要体积最小的，只包含必要功能的可执行文件
  > (在 Windows 上编译，最终的独立可执行文件 `.exe` 的大小仅仅约为 3.0 MiB)

  ```shell
  cargo run --no-default-features
  cargo build --release --no-default-features
  ```

## 其他

- 除了通过 `-x, --proxy` 参数指定代理地址外，通过 "系统代理" 或环境变量 `HTTP_PROXY` 或 `HTTPS_PROXY` 设置的代理均有效。
- `-v` 参数最多支持 4 个，即 `-vvvv` 。

- Features
  - 若编译时禁用了 `log` feature ，则命令行 `-v` 参数无效。
  - 若编译时禁用了 `search-option` feature ，则在由 `/self` 路由所返回的 API 节点详细信息中，`options.supported` 数组将为空。

## TODO

- [ ] 添加更多的信息源/发布站
