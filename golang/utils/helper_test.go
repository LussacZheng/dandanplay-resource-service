package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/gin-gonic/gin"
)

/**
 * Use `Error` if the methods are going to be used across different tests.
 * Use `Fatal` if continuing to run the test can't possibly give you any more
 *   information useful in debugging.
 * Using `Error` instead of `Fatal` for each check means your test will always
 *   run them all and report which ones failed.
 *
 * https://stackoverflow.com/questions/24593115/error-vs-fatal-in-tests
 */

func TestTemplate(t *testing.T) {
	const (
		addr     = "localhost:60808"
		url      = "/topics/list/page/1?keyword={{.Keyword}}&sort_id={{.Sort}}&team_id={{.Team}}&order=date-desc"
		expected = "/topics/list/page/1?keyword=Hello&sort_id=789&team_id=123&order=date-desc"
	)
	requestURL := fmt.Sprintf("http://%s/list?keyword=Hello&subgroup=123&type=789&resp=1234321", addr)

	type query struct {
		Keyword string `form:"keyword"`
		Team    int    `form:"subgroup"`
		Sort    int    `form:"type"`
		Random  string `form:"r"`
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
				t.Error(err)
			}
			c.JSON(200, gin.H{
				"result": result,
			})
		})
		_ = r.Run(addr)
	}()

	resp, err := http.Get(requestURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		t.Error("Unable to send a request.", err)
	}
	defer resp.Body.Close()

	rb := respBody{}
	body, _ := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(body, &rb)
	if err != nil {
		t.Error("Unable to unmarshal the response body.", err)
	}

	t.Log("Expected url:   ", expected)
	t.Log("Returned result:", rb.Result)

	if rb.Result != expected {
		t.Fatal("The returned result is not as expected")
	}
}
