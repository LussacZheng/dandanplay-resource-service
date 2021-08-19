package kisssub

import (
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gocolly/colly/v2"

	"dandanplay-resource-service/api"
	"dandanplay-resource-service/service"
	"dandanplay-resource-service/utils"
	"dandanplay-resource-service/utils/logger"
	"dandanplay-resource-service/utils/opencc"
)

var Provider *api.Provider

func init() {
	Provider = &api.Provider{
		Name:      "爱恋动漫",
		IsEnabled: true,
		Route:     "/kisssub",
		Scraper:   &kisssub{},
	}
}

const (
	// TODO: all the websites of MioBT platform can be scraped by the same code.
	//   Add a configuration item, or command-line option, for this in the future.
	//   ref: https://www.miobt.com/addon.php?r=document/view&page=miobt-introduction
	//   base = "https://www.miobt.com"; base = "https://www.comicat.org"
	base = "https://www.kisssub.org"

	typeAndSubgroupUrl = base + "/addon.php?r=sublist/group"
	userAgent          = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.32 Safari/537.36 Kisssub/12"

	// listUrl   = base + "/search.php?keyword={{.Keyword}}+{{.Team}}+sort_id:{{.Sort}}&page=1"
	// listUrl2  = base + "/search.php?bound=content&keyword={{.Keyword}}&sort_id={{.Sort}}&local=1&field=title&node_id=0&external=google"
)

var (
	teamMap      sync.Map
	isTeamLoaded bool

	regexTypeId = regexp.MustCompile("sort-(\\d+)-")
	regexMagnet = regexp.MustCompile("show-([0-9a-fA-F]{40})")
)

type kisssub struct{}

func (k *kisssub) NewCollector() *colly.Collector {
	return service.NewCollector(service.CollectorOption{
		UserAgent:  userAgent,
		AllowProxy: true,
	})
}

func (k *kisssub) Type(types *api.Types) error {
	c := k.NewCollector()

	c.OnHTML("#smenu li a[href|=sort]", func(e *colly.HTMLElement) {
		id := utils.MatchInt(regexTypeId, e.Attr("href"))
		types.Types = append(types.Types, api.Sort{
			Id:   id,
			Name: e.Text,
		})
	})

	return service.Visit(c, typeAndSubgroupUrl)
}

func (k *kisssub) Subgroup(subgroups *api.Subgroups) error {
	c := k.NewCollector()

	// The search function of Kisssub does not require a Team.Id
	// It appends the Team.Name to the keyword
	count := 1

	c.OnHTML("#bgm-table dd a", func(e *colly.HTMLElement) {
		storeTeamMap(opencc.T2S(e.Text), count)
		// This only skipped when called in k.ListQueryFormatter()
		if subgroups != nil {
			subgroups.Subgroups = append(subgroups.Subgroups, api.Team{
				Id:   count,
				Name: e.Text,
			})
		}
		count++
	})

	err := service.VisitAndRun(c, typeAndSubgroupUrl, func(a ...interface{}) {
		isTeamLoaded = true
		logger.Infof("{{[Kisssub] total teams:}} %d\n", count-1)
	})
	if err != nil {
		isTeamLoaded = false
		logger.Warnf("{{[Kisssub] isTeamLoaded:}} %t\n", isTeamLoaded)
		logger.Errorf("{{Failed when generating Team map of Kisssub.}} %v\n", err)
	}

	return err
}

func (k *kisssub) List(list *api.List, requestURL string, _ *api.SearchOptions, _ *api.ListQuery) error {
	c := k.NewCollector()

	c.OnHTML("a.nextprev", func(e *colly.HTMLElement) {
		list.HasMore = true
	})

	c.OnHTML("table#listTable tbody tr", func(e *colly.HTMLElement) {
		// No search result: <td colspan="8">没有可显示资源</td>
		if e.ChildText("td:first-child") == "没有可显示资源" {
			return
		}

		// The Resources of Kisssub seem to always have a SubgroupName and Magnet.
		Title := e.ChildText("td:nth-child(3) a[href]")
		PageUrl := e.ChildAttr("td:nth-child(3) a[href]", "href")
		Magnet := fmt.Sprintf(
			"magnet:?xt=urn:btih:%s&tr=http://open.acgtracker.com:1096/announce",
			utils.MatchString(regexMagnet, PageUrl),
		)

		TypeId := utils.MatchInt(regexTypeId, e.ChildAttr("td:nth-child(2) a[href]", "href"))
		TypeName := e.ChildText("td:nth-child(2) a[href]")

		// TODO: SubgroupName might be "[email protected]" if the uploader use his/her email as username.
		// 	 For example, try to search "Fate系列2006-2018全":
		// 	 https://www.kisssub.org/search.php?keyword=Fate%E7%B3%BB%E5%88%972006-2018%E5%85%A8
		SubgroupName := opencc.T2S(e.ChildText("td:nth-child(8) a"))
		SubgroupId := loadTeamIdByName(SubgroupName)

		FileSize := e.ChildText("td:nth-child(4)")

		// The PublishDate of Kisssub Resources can only be found on the details page of each Resource.
		// Now it can only be accurate to the day. Hours, minutes, and seconds are all unknown.
		date := strings.TrimSpace(e.ChildText("td:nth-child(1)"))
		var (
			PublishDate time.Time
			err         error
		)
		// Only resources published in the last three days provide detailed time.
		if strings.Contains(date, "天") {
			date = utils.TemporalDateToTimeString(date)
			PublishDate, err = time.Parse("2006/01/02 15:04", date)
		} else {
			PublishDate, err = time.Parse("2006/01/02", date)
		}
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
			PageUrl:      base + "/" + PageUrl,
			FileSize:     FileSize,
			PublishDate:  PublishDate.Format("2006-01-02 15:04:05"),
		}
		// The SubgroupId can still be unknown (It's 0 when SubgroupName is not in teamMap)
		res.Fill()

		list.Resources = append(list.Resources, res)
	})

	return service.Visit(c, requestURL)
}

func (k *kisssub) ListQueryFormatter(query *api.ListQuery) string {
	// convert all the query strings into keyword before generate the requestURL
	if query.Team != 0 {
		if !isTeamLoaded {
			_ = k.Subgroup(nil)
		}
		// Do NOT escape "+"
		if name := loadTeamNameById(query.Team); name != "" {
			query.Keyword += "+" + url.QueryEscape(name)
		}
	}
	if query.Sort != 0 {
		query.Keyword += "+sort_id" + url.QueryEscape(":") + strconv.Itoa(query.Sort)
	}
	// fmt.Println("query.Keyword:", query.Keyword)

	result := base + "/search.php?keyword=" + query.Keyword
	return result
}

func storeTeamMap(teamName string, teamId int) {
	teamMap.LoadOrStore(teamName, teamId)
	teamMap.LoadOrStore(teamId, teamName)
}

func loadTeamIdByName(teamName string) int {
	value, ok := teamMap.Load(teamName)
	if !ok {
		return 0
	}
	return value.(int)
}

func loadTeamNameById(teamId int) string {
	value, ok := teamMap.Load(teamId)
	if !ok {
		return ""
	}
	return value.(string)
}
