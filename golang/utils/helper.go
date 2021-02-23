package utils

import (
	"bytes"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"
	"text/template"
	"time"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/utils/colorize"
	"dandanplay-resource-service/utils/logger"
)

// PrintVersionInfo prints the version number
func PrintVersionInfo() {
	fmt.Printf("%s: version %s . \n%s\n",
		colorize.Name.Sprint(config.Name),
		colorize.Version.Sprint(config.Version),
		config.ShortDescription,
	)
}

// Template applies a parsed template to the specified data object.
// It is a shortcut for text.template.Execute
func Template(format string, payload interface{}) (string, error) {
	var buf bytes.Buffer
	tmpl, err := template.New("t").Parse(format)
	if err != nil {
		return "", err
	}
	err = tmpl.Execute(&buf, payload)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}

// ParseInt returns math.MinInt32 if failed to parse
func ParseInt(s string) int {
	result, err := strconv.Atoi(s)
	if err != nil {
		logger.Errorf("{{Failed when convert string to int.}} %v\n", err)
		return math.MinInt32
	}
	return result
}

// MatchString returns the first captured substring
func MatchString(regex *regexp.Regexp, s string) string {
	return regex.FindStringSubmatch(s)[1]
}

// MatchInt gets the first captured substring, and returns it as an integer
func MatchInt(regex *regexp.Regexp, s string) int {
	return ParseInt(regex.FindStringSubmatch(s)[1])
}

// TemporalDateToTimeString converts a relative day, such as
// "今天"(today), "昨天"(yesterday), "前天"(the day before yesterday), and so on,
// into a time string in the layout of "2006/01/02"
func TemporalDateToTimeString(s string) string {
	var date time.Time
	location, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		logger.Warnf("{{Failed to set time.Location, please install tzdata/zoneinfo first.}} %v\n", err)
		date = time.Now()
	} else {
		date = time.Now().In(location)
	}

	s = strings.ReplaceAll(s, "今天",
		date.Format("2006/01/02"),
	)
	s = strings.ReplaceAll(s, "昨天",
		date.AddDate(0, 0, -1).Format("2006/01/02"),
	)
	s = strings.ReplaceAll(s, "前天",
		date.AddDate(0, 0, -2).Format("2006/01/02"),
	)

	//return "0001/01/01"
	return s
}
