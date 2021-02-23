# KissSub Scraper

- GET [/kisssub/type](http://localhost:8080/kisssub/type)
- GET [/kisssub/subgroup](http://localhost:8080/kisssub/subgroup)
- GET [/kisssub/list](http://localhost:8080/kisssub/list)

## Known Issues

- [ ] SubgroupID 无法与 dmhy 统一。即与 dmhy 混用时会导致自动下载解析错乱。
- [ ] 不支持带 <kbd>&</kbd> <kbd>|</kbd> <kbd>!</kbd> <kbd>(</kbd> <kbd>)</kbd> 的高级搜索。

## Test urls

- [/kisssub/list?keyword=fate](http://localhost:8080/kisssub/list?keyword=fate)
- [/kisssub/list?keyword=你好&subgroup=12](http://localhost:8080/kisssub/list?keyword=%E4%BD%A0%E5%A5%BD&subgroup=12)
- [/kisssub/list?keyword=fate&subgroup=278&type=5](http://localhost:8080/kisssub/list?keyword=fate&subgroup=278&type=5)
- [/kisssub/list?keyword=fate&subgroup=450&type=1&r=1234321](http://localhost:8080/kisssub/list?keyword=fate&subgroup=450&type=1&r=1234321)
- [/kisssub/list?keyword=fate&subgroup=你好&type=2&r=你好啊](http://localhost:8080/kisssub/list?keyword=fate&subgroup=%E4%BD%A0%E5%A5%BD&type=2&r=%E4%BD%A0%E5%A5%BD%E5%95%8A)
