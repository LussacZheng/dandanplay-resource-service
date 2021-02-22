package api

type Sort struct {
	Id   int
	Name string
}
type Team struct {
	Id   int
	Name string
}
type Resource struct {
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
	Types []Sort
}
type Subgroups struct {
	Subgroups []Team
}
type List struct {
	HasMore   bool
	Resources []Resource
}

type ListQuery struct {
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

// Fill fills in the empty fields with the above predefined values
func (r *Resource) Fill() {
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
