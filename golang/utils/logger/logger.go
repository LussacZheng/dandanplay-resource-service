package logger

import (
	"log"
	"os"
	"regexp"

	"dandanplay-resource-service/utils/colorize"
)

var (
	infoLogger, warnLogger, errorLogger *log.Logger
)

func init() {
	// or infoLogger = log.New(os.Stderr, replace("{{[API]}} ", &colorize.Info), log.Ldate|log.Ltime)
	infoLogger = log.New(os.Stderr, colorize.Info.Sprint("[API]")+" ", log.Ldate|log.Ltime)
	warnLogger = log.New(os.Stderr, colorize.Warn.Sprint("[API]")+" ", log.Ldate|log.Ltime)
	errorLogger = log.New(os.Stderr, colorize.Error.Sprint("[API]")+" ", log.Ldate|log.Ltime)
}

func replace(format string, style *colorize.Style) (colorized string) {
	reg, err := regexp.Compile("{{(.*?)}}")
	if err != nil {
		panic(err)
	}
	colorized = reg.ReplaceAllString(format, style.Sprint("$1"))
	return
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Infof(format string, v ...interface{}) {
	format = replace(format, &colorize.Info)
	infoLogger.Printf(format, v...)
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Warnf(format string, v ...interface{}) {
	format = replace(format, &colorize.Warn)
	warnLogger.Printf(format, v...)
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Errorf(format string, v ...interface{}) {
	format = replace(format, &colorize.Error)
	errorLogger.Printf(format, v...)
}
