package config

const (
	Name             = "dandanplay-resource-service"
	ShortDescription = "API implementation for 'dandanplay' resource search service."
	LongDescription  = "API implementation for 'dandanplay' resource search service, in Golang."

	Version = "0.0.5-alpha"

	Homepage = "https://github.com/LussacZheng/dandanplay-resource-service"
)

var (
	// Host is the IP address that the API listens on
	Host string
	// Port is the listen port of the API
	Port string
	// Proxy is the proxy address for web scraper
	Proxy string

	IsDryRun bool
	IsDebug  bool
)

const HtmlStringIndex = `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>弹弹play资源搜索节点API</title>
    <style>
      body {
        padding: 0 1.5em 3em;
      }

      p,
      span,
      li {
        margin: 0.5em;
        color: dimgrey;
      }

      a {
        text-decoration: none;
        color: cadetblue;
      }
      a:hover {
        color: dodgerblue;
      }

      h1 > a {
        font-size: 1.5em;
      }
      h1 > span a {
        color: dimgrey;
        font-size: 1em;
      }
      h1 > span a:hover {
        color: grey;
      }

      p {
        font-size: 2em;
      }

      ul {
        list-style: none;
      }
      li:before {
        content: '\02022';
        color: darkgrey;
        margin-right: 0.3em;
      }
      li {
        word-break: break-all;
        font-size: 1.5em;
      }

      li#clip * {
        vertical-align: middle;
      }
      li button {
        width: 6em;
        height: 2em;
        margin: 0 1em;
        border-width: 0;
        border-radius: 1em;
        background: #1e90ff;
        cursor: pointer;
        outline: none;
        color: white;
        font-size: 0.6em;
        text-indent: 0.5em;
        letter-spacing: 0.5em;
        text-align: center;
      }
      button:hover {
        background: #5599ff;
      }

      .success {
        color: #28a745;
      }
      .empty {
        color: #ffc107;
      }
      .fail {
        color: #dc3545;
      }
    </style>
  </head>

  <body>
    <h1>
      <a href="https://github.com/LussacZheng/dandanplay-resource-service"
        >dandanplay-resource-service</a
      >
      <span>
        <i
          ><a href="https://github.com/LussacZheng/dandanplay-resource-service/releases"
            >v0.0.5-alpha</a
          ><span id="impl">(go-impl)</span></i
        ></span
      >
    </h1>
    <div>
      <p>资源搜索节点地址</p>
      <ul>
        <li id="clip">
          <a href="/" id="uri">/</a>
          <button onclick="copy()">复制</button>
        </li>
      </ul>
    </div>
    <div>
      <p>API</p>
      <ul>
        <li>GET <a href="/type" target="_blank">/type</a></li>
        <li>GET <a href="/subgroup" target="_blank">/subgroup</a></li>
        <li>GET <a href="/list" target="_blank">/list</a></li>
        <li>GET <a href="/self" target="_blank">/self</a></li>
      </ul>
    </div>
    <div>
      <p>测试链接</p>
      <ul>
        <li>
          <span class="success">仅搜索词：</span>
          <a href="/list?keyword=fate" target="_blank">/list?keyword=fate</a>
        </li>
        <li>
          <span class="success">字幕组和类型：</span>
          <a href="/list?keyword=fate&subgroup=619&type=2&r=1234321" target="_blank"
            >/list?keyword=fate&subgroup=619&type=2&r=1234321</a
          >
        </li>
        <li>
          <span class="empty">无结果：</span>
          <a href="/list?keyword=abcdefghijklmnopqrstuvwxyz" target="_blank"
            >/list?keyword=abcdefghijklmnopqrstuvwxyz</a
          >
        </li>
        <li>
          <span class="success">无磁链：</span>
          <a href="/list?keyword=%E4%BD%A0%E5%A5%BD%E5%AE%89%E5%A6%AE" target="_blank"
            >/list?keyword=你好安妮</a
          >
        </li>
        <li>
          <span class="empty">非法参数1：</span>
          <a href="/list?keyword=%" target="_blank">/list?keyword=%</a>
        </li>
        <li>
          <span class="success">非法参数2：</span>
          <a href="/list?keyword=fate&subgroup=-123&type=-456&r=-1234321" target="_blank"
            >/list?keyword=fate&subgroup=-123&type=-456&r=-78987</a
          >
        </li>
        <li>
          <span class="success">非法参数3：</span>
          <a
            href="/list?keyword=fate&subgroup=%E4%BD%A0%E5%A5%BD&type=%E4%BD%A0%E5%A5%BD&r=%E4%BD%A0%E5%A5%BD"
            target="_blank"
            >/list?keyword=fate&subgroup=你好&type=你好&r=你好</a
          >
        </li>
      </ul>
    </div>
    <script defer>
      var e = document.getElementById('uri')
      e.innerHTML = e.href.slice(0, -1)
      function copy() {
        var input = document.createElement('input')
        input.setAttribute('readonly', 'readonly')
        input.setAttribute('value', e.innerHTML)
        document.body.appendChild(input)
        input.focus()
        input.setSelectionRange(0, 9999)
        if (document.execCommand('copy')) {
          document.execCommand('copy')
        }
        input.blur()
        document.body.removeChild(input)
      }
    </script>
  </body>
</html>
`
