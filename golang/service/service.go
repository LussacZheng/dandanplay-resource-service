package service

import (
	"strings"

	"github.com/gocolly/colly/v2"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/utils/logger"
)

// CollectorOption is used for configuration while creating a colly.Collector instance
type CollectorOption struct {
	UserAgent  string // TODO: Add random user-agents.
	AllowProxy bool   // TODO: Used for configuration in the future. Temporarily invalid.
}

// NewCollector creates a new colly.Collector instance
func NewCollector(option CollectorOption) *colly.Collector {
	if option.UserAgent == "" {
		option.UserAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0"
	}

	c := colly.NewCollector(
		colly.UserAgent(option.UserAgent),
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

// Visit starts colly.Collector's collecting job
func Visit(c *colly.Collector, url string) error {
	// Before making a request
	c.OnRequest(func(r *colly.Request) {
		logger.Infof("{{Visiting}} %s\n", r.URL.String())
	})

	var err error

	if config.IsDryRun {
		logger.AsDebugf("{{Ready but not actually visiting}}:\n")
		logger.AsDebugf("{{%s}}\n", url)
	} else {
		err = c.Visit(url)
		c.Wait()
	}

	return err
}

// VisitAndRun starts the job as Visit, and executes the provided callbackFunc
// after the collector jobs are finished.
func VisitAndRun(
	c *colly.Collector, url string,
	callback func(...interface{}), a ...interface{},
) error {
	c.OnRequest(func(r *colly.Request) {
		logger.Infof("{{Visiting}} %s\n", r.URL.String())
	})

	err := c.Visit(url)
	c.Wait()
	callback(a...)
	return err
}
