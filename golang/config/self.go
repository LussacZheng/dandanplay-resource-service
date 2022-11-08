package config

import (
	"regexp"
	"runtime"
	"strings"
)

var (
	gitCommitHash = "unknown commit"
	buildDate     = "unknown time" // UTC time "yyyy-MM-ddTHH:mm:ssZ"

	regex = regexp.MustCompile(`^[\d.]+$`)
)

type h map[string]interface{}

var MetaInfo = h{
	"name":    Name,
	"version": Version,
	"dev":     !regex.MatchString(Version), // development version or stable release
	"info": h{
		"homepage":    Homepage,
		"description": LongDescription,
	},
	"meta": h{
		"implementation": h{
			"platform": runtime.GOOS + "/" + runtime.GOARCH,
			"tool":     "golang",
			"version":  strings.TrimPrefix(runtime.Version(), "go"),
		},
		"git_commit_hash": gitCommitHash,
		"build_at":        buildDate,
	},
	"options": h{
		"instruction": "https://github.com/LussacZheng/dandanplay-resource-service/tree/main/docs",
		"supported":   []string{"$realtime", "$page", "$limit"},
	},
}

// https://github.com/gin-gonic/gin/issues/2360
