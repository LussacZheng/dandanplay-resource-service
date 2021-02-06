package dmhy

import (
	"strings"
	"time"

	"github.com/gocolly/colly/v2"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/utils"
	"dandanplay-resource-service/utils/logger"
)

const (
	base               = "https://share.dmhy.org"
	typeAndSubgroupUrl = base + "/topics/advanced-search?team_id=0&sort_id=0&orderby="
	listUrl            = base + "/topics/list/page/1?keyword={{.Keyword}}&sort_id={{.Sort}}&team_id={{.Team}}&order=date-desc"
)

func newCollector() *colly.Collector {
	c := colly.NewCollector(
		colly.UserAgent("Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"),
	)

	if config.Proxy != "" {
		if !strings.Contains(config.Proxy, "/") {
			config.Proxy = "//" + config.Proxy
		}
		err := c.SetProxy(config.Proxy)
		if err != nil {
			logger.Errorf("{{Failed when setting proxy.}} %v\n", err)
		}
	}

	return c
}

func visit(c *colly.Collector, url string) error {
	// Before making a request
	c.OnRequest(func(r *colly.Request) {
		logger.Infof("{{Visiting}} %s\n", r.URL.String())
	})

	err := c.Visit(url)
	//c.Wait()
	return err
}

func getTypes() (Types, error) {
	var types Types

	c := newCollector()

	// CSS Selector
	// https://www.w3school.com.cn/cssref/css_selectors.asp
	c.OnHTML("select#AdvSearchSort option[value]", func(e *colly.HTMLElement) {
		id := utils.ParseInt(e.Attr("value"))
		types.Types = append(types.Types, sort{
			Id:   id,
			Name: e.Text,
		})
	})

	err := visit(c, typeAndSubgroupUrl)

	// If there are no search results, return an empty slice (empty array in JSON)
	if types.Types == nil {
		types.Types = []sort{}
	}

	return types, err
}

func getSubgroups() (Subgroups, error) {
	var subgroups Subgroups

	c := newCollector()

	c.OnHTML("select#AdvSearchTeam option[value]", func(e *colly.HTMLElement) {
		id := utils.ParseInt(e.Attr("value"))
		subgroups.Subgroups = append(subgroups.Subgroups, team{
			Id:   id,
			Name: e.Text,
		})
	})

	err := visit(c, typeAndSubgroupUrl)

	// If there are no search results, return an empty slice (empty array in JSON)
	if subgroups.Subgroups == nil {
		subgroups.Subgroups = []team{}
	}

	return subgroups, err
}

func getList(query *listQuery) (List, error) {
	var list List

	url, err := utils.Template(listUrl, query)
	if err != nil {
		logger.Errorf("{{Failed when parsing query string.}} %v\n", err)
	}

	c := newCollector()

	c.OnHTML("div.nav_title>div.fl", func(e *colly.HTMLElement) {
		list.HasMore = e.ChildText("a") == "下一頁"
	})

	c.OnHTML("table#topic_list tbody tr", func(e *colly.HTMLElement) {
		var (
			Title        string
			SubgroupId   int
			SubgroupName string
			PageUrl      string
		)

		// When len(titleAndSubgroup) is 2, it means there is a team/subgroup for this resource.
		// When len(titleAndSubgroup) is 1, it means there is no team/subgroup.
		if titleAndSubgroup := e.ChildTexts("td:nth-child(3) a"); len(titleAndSubgroup) > 1 {
			SubgroupName = titleAndSubgroup[0]
			Title = titleAndSubgroup[1]
			SubgroupId = utils.ParseInt(
				strings.TrimPrefix(
					e.ChildAttr("td:nth-child(3) a[href]", "href"),
					"/topics/list/team_id/",
				),
			)
			PageUrl = e.ChildAttr("td:nth-child(3) a:nth-child(2)[href]", "href")
		} else {
			//SubgroupId = unknown["SubgroupId"].(int)
			//SubgroupName = unknown["SubgroupName"].(string)
			Title = titleAndSubgroup[0]
			PageUrl = e.ChildAttr("td:nth-child(3) a", "href")
		}

		TypeId := utils.ParseInt(
			strings.TrimPrefix(
				e.ChildAttr("td:nth-child(2) a[href]", "class"),
				"sort-",
			),
		)
		TypeName := e.ChildText("td:nth-child(2) a[href]")
		Magnet := e.ChildAttr("td:nth-child(4) a[href]", "href")
		FileSize := e.ChildText("td:nth-child(5)")

		PublishDate, err := time.Parse("2006/01/02 15:04", e.ChildText("td:nth-child(1) span"))
		if err != nil {
			logger.Errorf("{{Failed when formatting time string.}} %v\n", err)
		}

		res := resource{
			Title:        strings.TrimSpace(Title),
			TypeId:       TypeId,
			TypeName:     TypeName,
			SubgroupId:   SubgroupId,
			SubgroupName: SubgroupName,
			Magnet:       Magnet,
			PageUrl:      base + PageUrl,
			FileSize:     FileSize,
			PublishDate:  PublishDate.Format("2006-01-02 15:04:05"),
		}
		res.fill()
		list.Resources = append(list.Resources, res)
	})

	err = visit(c, url)

	// If there are no search results, return an empty slice (empty array in JSON)
	if list.Resources == nil {
		list.Resources = []resource{}
	}

	return list, err
}
