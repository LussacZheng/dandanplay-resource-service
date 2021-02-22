package api

import (
	"net/http"
	"net/url"

	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly/v2"

	"dandanplay-resource-service/utils/logger"
)

// ICollector defines that each Provider should implement a customized NewCollector()
type ICollector interface {
	NewCollector() *colly.Collector
}

// IScraper defines the functions what a Provider should implement,
// and how to extract resource information.
type IScraper interface {
	Type(types *Types) error
	Subgroup(subgroups *Subgroups) error
	List(list *List, requestURL string) error
	ListQueryFormatter(query *ListQuery) string
}

// Provider defines the route group and its scrapers
type Provider struct {
	Name      string // TODO: Temporarily useless.
	IsEnabled bool   // TODO: Used for configuration in the future. Temporarily invalid.
	Route     string
	Scraper   IScraper
}

// GenerateType is the handler of the route: GET /type
func (p *Provider) GenerateType(c *gin.Context) {
	// If there are no search results, return an empty slice (empty array in JSON)
	types := Types{
		Types: []Sort{},
	}
	err := p.Scraper.Type(&types)
	c.JSON(getStatus(err), types)
}

// GenerateSubgroup is the handler of the route: GET /subgroup
func (p *Provider) GenerateSubgroup(c *gin.Context) {
	subgroups := Subgroups{
		Subgroups: []Team{},
	}
	err := p.Scraper.Subgroup(&subgroups)
	c.JSON(getStatus(err), subgroups)
}

// GenerateList is the handler of the route: GET /list
func (p *Provider) GenerateList(c *gin.Context) {
	var query ListQuery
	err := c.ShouldBindQuery(&query)
	if err != nil {
		logger.Errorf("{{Failed when binding query string.}} %v\n", err)
	}

	query.Keyword = url.QueryEscape(query.Keyword)
	if query.Team < 0 {
		query.Team = 0
	}
	if query.Sort < 0 {
		query.Sort = 0
	}
	requestURL := p.Scraper.ListQueryFormatter(&query)

	list := List{
		HasMore:   false,
		Resources: []Resource{},
	}
	err = p.Scraper.List(&list, requestURL)
	c.JSON(getStatus(err), list)
}

// getStatus returns "200" only when err is nil
func getStatus(err error) int {
	status := http.StatusOK
	if err != nil {
		status = http.StatusInternalServerError
		logger.Errorf("{{Failed when parsing the webpage.}} %v\n", err)
	}
	return status
}
