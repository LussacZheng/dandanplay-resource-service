package dmhy

import (
	"net/http"
	"net/url"

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

/**
 * Return a predefined special value if certain fields failed to parse.
 *
 * Note: These "predefined special values" are not officially defined by dandanplay.
 *       Just some temporary placeholders.
 */
var unknown = map[string]interface{}{
	//"Title":        "未能成功解析标题",
	//"TypeId ":      -2,
	//"TypeName":     "未能成功解析类别",
	"SubgroupId":   -1,
	"SubgroupName": "未知字幕组",
	/**
	 * If some expired resource didn't provide the magnetic link,
	 *   only by returning the string with certain format (with prefix "magnet"),
	 * can the `java.lang.StringIndexOutOfBoundsException` on Android client be avoided.
	 *
	 * For example, try to search "你好安妮"
	 */
	"Magnet": "magnet_not_found_未能成功解析磁力链接或磁力链接不存在",
	//"PageUrl":     "未能成功解析资源发布页面",
	//"FileSize":    "未能成功解析资源大小",
	//"PublishDate": "1970-01-01 08:00:00",
}

// fill fills in the empty fields with the above predefined values
func (r *resource) fill() {
	if r.SubgroupId == 0 {
		r.SubgroupId = unknown["SubgroupId"].(int)
	}
	if r.SubgroupName == "" {
		r.SubgroupName = unknown["SubgroupName"].(string)
	}
	if r.Magnet == "" {
		r.Magnet = unknown["Magnet"].(string)
	}
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

	list, err := getList(&query)
	c.JSON(getStatus(err), list)
}
