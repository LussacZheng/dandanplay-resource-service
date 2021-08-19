package api

import (
	"reflect"
	"strconv"
	"strings"

	"github.com/dlclark/regexp2"
)

// SearchOptions contains a Keyword and some search-Options
type SearchOptions struct {
	Keyword string
	Options *option
}

type option struct {
	Realtime int
	Page     int
	Limit    int
	// sort     int
}

type situation string
type optionMap map[string]int

const (
	unused     situation = "unused"
	unassigned situation = "unassigned"
	undefined  situation = "undefined"

	// defaultValue is the default int other than these situations
	defaultValue = 1
)

// defaults contains the default value that should be given to an option in certain situation
var defaults = map[situation]interface{}{
	unused: optionMap{
		"realtime": 0,
		"page":     1,
		"limit":    200,
		// "sort": 0,
	},
	unassigned: optionMap{
		"realtime": 1,
		"page":     1,
		"limit":    80,
		// "sort": 1,
	},
	undefined: 1,
}

// newSearchOptions constructor returns a formatted SearchOptions based on the searchStr
func newSearchOptions(searchStr string) *SearchOptions {
	keyword, optMap := parseSearchOperator(searchStr)
	opt := option{}
	loader(&opt, optMap, "realtime", "page", "limit")
	result := &SearchOptions{
		Keyword: keyword,
		Options: &opt,
	}
	return result
}

var regexOption = regexp2.MustCompile(` ?(?<!\$|\w)\$([a-z]+)(?::(\d+))?(?=\s|$)`, 0)

// parseSearchOperator parses the Keyword and Options from the searchStr
func parseSearchOperator(searchStr string) (string, optionMap) {
	result := make(optionMap)

	keyword, _ := regexOption.ReplaceFunc(searchStr, func(match regexp2.Match) string {
		// match.Capture.String() == match.String()
		optionName := match.Groups()[1].String()
		optionValueStr := match.Groups()[2].String()
		optionValue, err := strconv.Atoi(optionValueStr)
		if err != nil || optionValueStr == "" {
			optionValue = defaultVal(unassigned, optionName)
		}
		result[optionName] = optionValue

		return ""
	}, -1, -1)

	return strings.ReplaceAll(keyword, "$$", "$"), result
}

// defaultVal takes the value from the map `defaults` based on the index passed and returns it
func defaultVal(s situation, key ...string) int {
	if m, ok := defaults[s]; ok {
		switch len(key) {
		case 0:
			return m.(int)
		case 1:
			if n, ok := m.(optionMap)[key[0]]; ok {
				return n
			}
			fallthrough
		default:
			return defaultValue
		}
	}
	return defaultValue
}

// loader will take the values from `optMap` based on the fieldNames,
// and fill them into the struct `opt`.
// NOTE: fieldNames should all be capitalized.
func loader(opt *option, optMap optionMap, fieldNames ...string) {
	for _, fieldName := range fieldNames {
		s := reflect.ValueOf(opt).Elem().FieldByName(strings.Title(fieldName))
		if num, ok := optMap[fieldName]; ok && num != 0 {
			s.SetInt(int64(num))
		} else {
			s.SetInt(int64(defaultVal(unused, fieldName)))
		}
	}
}
