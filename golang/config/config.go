package config

const (
	Name             = "dandanplay-resource-service"
	ShortDescription = `API implementations for "dandanplay" resource search service.`
	LongDescription  = `API implementations for "dandanplay" resource search service, in Golang.`

	Version = "0.0.1"
)

var Host, Port, Proxy string

const HtmlStringIndex = `
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>弹弹play资源搜索节点API</title>
    <style>
      body {
        padding: 1em;
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
      }
      li,
      p {
        margin: 0.5em;
        font-size: 2em;
        color: dimgrey;
      }
      a {
        text-decoration: none;
        color: cadetblue;
      }
      a:hover {
        color: dodgerblue;
      }

      li#clip * {
        vertical-align: middle;
      }
      li button {
        width: 6em;
        height: 2em;
        margin: 0 1em;
        border-width: 0;
        border-radius: 0.3em;
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
    </style>
  </head>

  <body>
    <div>
      <p>资源搜索节点地址：</p>
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
      </ul>
    </div>
    <div>
      <p>测试链接：</p>
      <ul>
        <li>
          <a href="/list?keyword=fate" target="_blank">/list?keyword=fate</a>
        </li>
        <li>
          <a href="/list?keyword=fate&subgroup=619&type=2&r=1234321" target="_blank"
            >/list?keyword=fate&subgroup=619&type=2&r=1234321</a
          >
        </li>
      </ul>
    </div>
    <script defer>
      var e = document.getElementById('uri')
      e.innerHTML = e.href.slice(0, -1)
      function copy() {
        const input = document.createElement('input')
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
