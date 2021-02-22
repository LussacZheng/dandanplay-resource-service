package dmhy

import (
	"strings"
	"time"

	"github.com/gocolly/colly/v2"

	"dandanplay-resource-service/api"
	"dandanplay-resource-service/service"
	"dandanplay-resource-service/utils"
	"dandanplay-resource-service/utils/logger"
)

var Provider *api.Provider

func init() {
	Provider = &api.Provider{
		Name:      "動漫花園",
		IsEnabled: true,
		Route:     "/",
		Scraper:   &dmhy{},
	}
}

const (
	base               = "https://share.dmhy.org"
	typeAndSubgroupUrl = base + "/topics/advanced-search?team_id=0&sort_id=0&orderby="
	listUrl            = base + "/topics/list/page/1?keyword={{.Keyword}}&sort_id={{.Sort}}&team_id={{.Team}}&order=date-desc"
)

type dmhy struct{}

func (d *dmhy) NewCollector() *colly.Collector {
	return service.NewCollector(service.CollectorOption{
		AllowProxy: true,
	})
}

func (d *dmhy) Type(types *api.Types) error {
	c := d.NewCollector()

	// CSS Selector
	// https://www.w3school.com.cn/cssref/css_selectors.asp
	c.OnHTML("select#AdvSearchSort option[value]", func(e *colly.HTMLElement) {
		id := utils.ParseInt(e.Attr("value"))
		types.Types = append(types.Types, api.Sort{
			Id:   id,
			Name: e.Text,
		})
	})

	return service.Visit(c, typeAndSubgroupUrl)
}

func (d *dmhy) Subgroup(subgroups *api.Subgroups) error {
	c := d.NewCollector()

	c.OnHTML("select#AdvSearchTeam option[value]", func(e *colly.HTMLElement) {
		id := utils.ParseInt(e.Attr("value"))
		subgroups.Subgroups = append(subgroups.Subgroups, api.Team{
			Id:   id,
			Name: e.Text,
		})
	})

	return service.Visit(c, typeAndSubgroupUrl)
}

func (d *dmhy) List(list *api.List, requestURL string) error {
	c := d.NewCollector()

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

		res := api.Resource{
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
		res.Fill()
		list.Resources = append(list.Resources, res)
	})

	return service.Visit(c, requestURL)
}

func (d *dmhy) ListQueryFormatter(query *api.ListQuery) string {
	result, err := utils.Template(listUrl, query)
	if err != nil {
		logger.Errorf("{{Failed when parsing query string.}} %v\n", err)
		return base + "/topics/list/page/1?keyword=" + query.Keyword
	}
	return result
}
