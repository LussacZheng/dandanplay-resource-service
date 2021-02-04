package rotuers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/models/dmhy"
)

func InitRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, config.HtmlStringIndex)
	})

	r.GET("/type", dmhy.GenerateType)
	r.GET("/subgroup", dmhy.GenerateSubgroup)
	r.GET("/list", dmhy.GenerateList)

	return r
}
