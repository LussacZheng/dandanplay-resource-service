package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestTemplate(t *testing.T) {
	const (
		addr        = ":60808"
		url         = "/topics/list/page/1?keyword={{.Keyword}}&sort_id={{.Sort}}&team_id={{.Team}}&order=date-desc"
		expectedUrl = "/topics/list/page/1?keyword=Hello&sort_id=789&team_id=123&order=date-desc"
	)
	requestUrl := fmt.Sprintf("http://localhost%s/list?keyword=Hello&subgroup=123&type=789&resp=1234321", addr)

	type query struct {
		Keyword string `form:"keyword"`
		Team    int    `form:"subgroup"`
		Sort    int    `form:"type"`
		Random  string `form:"resp"`
	}

	type respBody struct {
		Result string `json:"result"`
	}

	go func() {
		r := gin.Default()
		r.GET("/list", func(c *gin.Context) {
			var q query
			_ = c.ShouldBindQuery(&q)
			result, err := Template(url, q)
			if err != nil {
				t.Log(err)
				t.FailNow()
			}
			c.JSON(200, gin.H{
				"result": result,
			})
		})
		_ = r.Run(addr)
	}()

	resp, err := http.Get(requestUrl)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Fatal("Unable to send a request.", err)
	}
	defer resp.Body.Close()

	rb := respBody{}
	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(body, &rb)
	if err != nil {
		t.Fatal("Unable to unmarshal the response body.", err)
	}

	t.Log("Expected url:   ", expectedUrl)
	t.Log("Returned result:", rb.Result)

	if rb.Result != expectedUrl {
		t.Log("The returned result is not as expected")
		t.FailNow()
	}
}
