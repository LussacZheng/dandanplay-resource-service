# Search Options / 搜索指令

> 本文所述内容**仅适用于本项目**，在由其他项目部署的 资源搜索节点 中，相关功能无法实现。

搜索选项 (Search Options) ，下文称“搜索指令”，是用于修改 API 节点默认行为的一系列 指令/参数 。

## 规范

### 目的

在不修改 [弹弹play客户端](http://www.dandanplay.com/) 和 [资源搜索节点API规范](https://github.com/kaedei/dandanplay-libraryindex/blob/master/api/ResourceService.md) 的前提下，为了实现对 API 节点行为的控制，本项目额外定义并实现了一些特性。

### 使用方法

在原搜索关键词后添加形如 `$option` 或 `$option:X` 的指令即可。其中 `option` 为指令名， `X` 为该指令对应的参数值，且 `X` 应为自然数。

所有支持的指令及其用途详见 [下文](#指令) 。

### 设计

> **为什么不通过请求参数 (QueryString) 来控制 API 节点的行为？**
>
> 例如: `/list?keyword={keyword}&option={value}`

因为我无法修改 弹弹play客户端 和 资源搜索节点API规范 ，所以只能通过一套 API 节点与用户约定好的传参规则，即在搜索关键词中嵌入“搜索指令” ，以实现传递额外参数并控制 API 节点的行为。  
例如: `/list?keyword={originalKeyword + $option:value}` 。

> **为什么选择 `$` 作为“搜索指令”的标识符？**

为了区别于常规的搜索关键词，而且番剧资源的标题 (Title) 或文件名一般不会含有这一符号。

## 指令

在本小节的表格中，

“默认值”一栏将列举两个默认值 `M/N` ，其含义如下：

- 若用户未使用此指令，该参数将被赋予默认值 `M` ，表示忽略该指令。
- 若用户通过形如 `$option` 的方式使用此指令，该参数将被赋予默认值 `N` 。相当于输入 `$option:N` 。
- 若用户指定 `$option:0` 或 `$option:M` ，则相当于没有输入该指令 ，亦即忽略该指令。

“可用”一栏表示该指令是否可用：

- 若为版本号，则表示该指令自此版本起可用；
- 若为 `dev` ，则表示该指令尚未完整实现，仍处于开发阶段；
- 若为 `none` ，则表示该指令在此实现中尚不可用，仍处于构思阶段。

### $realtime

|    指令     |  建议形式   | 默认值 |                    可用                     |       作用       |
| :---------: | :---------: | :----: | :-----------------------------------------: | :--------------: |
| `$realtime` | `$realtime` |  0/1   | cfw-impl: `v0.0.4-alpha` <br> go-impl: none | 是否进行实时搜索 |

当番剧资源刚发布后的一段时间内，虽然其在 [dmhy 首页](https://share.dmhy.org/) 可见，但无法通过关键词搜索到，即暂时不会出现在搜索结果页中。<sup>[#1](https://github.com/LussacZheng/dandanplay-resource-service/issues/1)</sup>
此时可以追加指令 `$realtime` 来将这些“延迟”资源的信息一并返回给客户端。

#### 使用演示

![$realtime 演示动画](https://user-images.githubusercontent.com/23522476/129456457-c89d0713-6c10-4588-8a09-81742fc25237.gif)

#### 其他

1. 为什么不默认进行实时搜索？  
   因为这会导致服务器对 dmhy 的请求次数直接翻倍。
2. `$realtime` 的  cf-worker 实现暂不支持“延迟”资源的简繁体转换。  
   即关键词为简中时，同名的繁中“延迟”资源不会出现在搜索结果中，反之亦然。
3. `$realtime` 会从 dmhy 首页寻找“延迟”资源，`$realtime:X` 则将从 dmhy 主页的第 X 页寻找“延迟”资源。

### $page

|  指令   | 建议形式  | 默认值 |                     可用                      |         作用          |
| :-----: | :-------: | :----: | :-------------------------------------------: | :-------------------: |
| `$page` | `$page:X` |  1/1   | cfw-impl: `v0.0.4-alpha.2` <br> go-impl: none | 获取搜索结果的第 X 页 |

当搜索热门或长篇番剧时，搜索结果往往不止一页，弹弹play 会提示 “搜索结果过多，请重新设定更精确的搜索条件”。
此时你可以追加关键词进行筛选，或使用 `$page:2` 来获取第二页的搜索结果。

### $limit

|   指令   |  建议形式  | 默认值 |                     可用                      |            作用            |
| :------: | :--------: | :----: | :-------------------------------------------: | :------------------------: |
| `$limit` | `$limit:X` | 200/80 | cfw-impl: `v0.0.4-alpha.2` <br> go-impl: none | 限制搜索结果的数量上限为 X |

搜索结果的数量默认上限为 200 ，但 dmhy 每页的资源数最多为 80 ，因此可以认为默认不设上限。
你可以通过 `$limit:X` 来减少返回的资源数量。显然当 `0 < X < 80` 时才能体现出作用。  

> 数量上限在计算时包括通过 `$realtime` 添加的“延迟”资源。  
> 假设通过 `$realtime` 可以找到 3 个“延迟”资源，则 `$realtime $page:2 $limit:50` 除了 3 个“延迟”资源外，
> 返回的是第二页的前 47 个资源，而不是第一页的后 30 个和第二页的前 17 个资源。

### $sort

|  指令   | 建议形式  | 默认值 |    可用    |            作用            |
| :-----: | :-------: | :----: | :--------: | :------------------------: |
| `$sort` | `$sort:X` |  0/1   | both: none | 搜索结果是否按文件大小排序 |

指定返回的搜索结果是否按文件大小排序。
`X` 只允许有三种取值： `0` 表示否，即保持默认的按发布时间降序；`1` 表示是，且按文件大小升序；`2` 表示是，且按文件大小降序。
大于 3 的值将被视为 3 。

## 注意事项 / 边界情况

> 用于识别指令的正则表达式为:  `/ ?(?<!\$|\w)\$(\w+)(?::(\d+))?(?=\s|$)/gi`
> <sup>[\[1\]](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_Expressions)</sup>

1. 使用指令时，搜索输入框内只允许 空格 这一种符号，即不能与带 <kbd>&</kbd> <kbd>|</kbd> <kbd>!</kbd> <kbd>(</kbd> <kbd>)</kbd> 的高级搜索同时使用。
2. 建议将指令追加到关键词后。
3. 指令可以插入到关键词前，但其后须以空格分隔。
4. 指令可以插入到关键词中，但前后须以空格分隔。
5. 可以同时使用多个指令，指令间也应以空格分隔。
6. 重复的指令只有最后一个会生效。
7. 解析指令后会将其，连同其之前的一个空格，从字符串中移除。
8. 未定义或拼写错误的指令将被（赋值为1并）忽略，无法生效。
9. 如果用户确实需要将 `$` 作为搜索关键词，则需要为（可能被误认为指令的）部分 `$` 用 `$$` 进行转义 (escape) 。  
   例如：若搜索词为 `keyword1 key$word2 $abc $中文` ，则实际应输入: `keyword1 key$word2 $$abc $中文` 。

以较为复杂的为例，当在 弹弹play客户端 的搜索框中输入以下内容时，解析结果如下：

- 实际输入:  
  "<code>$page:3 &nbsp;fate stay $realtime $realtime:-1 $realtime:1.5 $reverse&nbsp; $limit:50 $n$ig$$ht$ $$abc $$efg:2 $中文指令 $sorted $limit $page:5</code>"
- 搜索词:  
  "<code>&nbsp; fate stay $realtime:-1 $realtime:1.5&nbsp; $n$ig$ht$ $abc $efg:2 $中文指令</code>"
- 指令及其值:
  - page: 5
  - realtime: 1
  - ~~reverse: 1~~ (未定义，无效)
  - limit: 80
  - ~~sorted: 1~~ (拼写错误，无效)
  - sort: 0 (未提及，故引用其默认值 `M` )

## 支持情况

**如何判断你正在使用的 资源搜索节点 是否支持某一搜索指令？**

访问 `/self` 即可得到 API 节点的详细版本信息， `options.supported` 数组即为支持的搜索指令。

> 首先，正如本文开篇所述，“搜索指令”**仅适用于本项目**部署的资源搜索节点。
>
> 以资源搜索节点 `https://aaa.bbb.workers.dev` 为例，访问 `https://aaa.bbb.workers.dev/self` 即可。

```jsonc
{
  "name": "dandanplay-resource-service",
  "version": "0.0.4-beta",
  "dev": true, // 开发版本 or 正式发行版
  "info": {
    "homepage": "https://github.com/LussacZheng/dandanplay-resource-service",
    "description": "API implementation for 'dandanplay' resource search service."
  },
  "meta": {
    "implementation": "cf-worker",
    "wrangler_version": "1.19.0",
    "golang_version": "none",
    "git_commit": "c88e59f"
  },
  "options": {
    "supported": ["$realtime", "$page", "$limit"],
    "instruction": "https://github.com/LussacZheng/dandanplay-resource-service/blob/main/docs/SearchOptions.md"
  }
}
```
