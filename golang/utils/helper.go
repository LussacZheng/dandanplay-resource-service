package utils

import (
	"bytes"
	"fmt"
	"math"
	"strconv"
	"text/template"

	"dandanplay-resource-service/config"
	"dandanplay-resource-service/utils/colorize"
	"dandanplay-resource-service/utils/logger"
)

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
