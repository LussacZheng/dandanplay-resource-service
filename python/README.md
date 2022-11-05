# dandanplay-resource-service: _py-impl_

此目录中包含 dandanplay-resource-service 的 [Python](https://www.python.org/) 相关实现。

## 开发

> [源代码](https://pastebin.ubuntu.com/p/mGP7JRpBtd/) / [参考](https://support.qq.com/products/104929/post/161035286010443896/) / [改版](https://github.com/IllyaTheHath/dandan-api)

个人推荐使用 [poetry](https://github.com/python-poetry/poetry) 进行依赖管理。

```shell
$ cd python

# 安装依赖
$ poetry install
# 或
$ poetry install --no-dev

# 运行脚本，如
$ poetry run python dandanplay-resource-service.py proxy=http://127.0.0.1:10809
# 或
$ poetry run python dandanplay-resource-service.py host=0.0.0.0 port=34543 proxy=""

# 打包
$ poetry run poe build
```
