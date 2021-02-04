package dmhy

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"dandanplay-resource-service/utils/logger"
)

type sort struct {
	Id   int
	Name string
}
type team struct {
	Id   int
	Name string
}
type resource struct {
	Title        string
	TypeId       int
	TypeName     string
	SubgroupId   int
	SubgroupName string
	Magnet       string
	PageUrl      string
	FileSize     string
	PublishDate  string
}

type Types struct {
	Types []sort
}
type Subgroups struct {
	Subgroups []team
}
type List struct {
	HasMore   bool
	Resources []resource
}

type listQuery struct {
	Keyword string `form:"keyword"`
	Team    int    `form:"subgroup"`
	Sort    int    `form:"type"`
	Random  string `form:"r"`
}

func getStatus(err error) int {
	status := http.StatusOK
	if err != nil {
		status = http.StatusInternalServerError
		logger.Errorf("{{Failed when parsing the webpage.}} %v\n", err)
	}
	return status
}

func GenerateType(c *gin.Context) {
	types, err := getTypes()
	c.JSON(getStatus(err), types)
}

func GenerateSubgroup(c *gin.Context) {
	subgroups, err := getSubgroups()
	c.JSON(getStatus(err), subgroups)
}

func GenerateList(c *gin.Context) {
	var query listQuery
	_ = c.ShouldBindQuery(&query)
	list, err := getList(&query)
	c.JSON(getStatus(err), list)
}
