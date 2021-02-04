package logger

import (
	"log"
	"os"
	"regexp"

	"github.com/gookit/color"
)

var (
	infoColor, warnColor, errorColor    color.Style
	infoLogger, warnLogger, errorLogger *log.Logger
)

func init() {
	infoColor = color.New(color.FgGreen)
	warnColor = color.New(color.FgRed, color.OpBold)
	errorColor = color.New(color.FgRed)

	infoLogger = log.New(os.Stderr, infoColor.Sprint("[API]")+" ", log.Ldate|log.Ltime)
	warnLogger = log.New(os.Stderr, warnColor.Sprint("[API]")+" ", log.Ldate|log.Ltime)
	errorLogger = log.New(os.Stderr, errorColor.Sprint("[API]")+" ", log.Ldate|log.Ltime)
}

func replace(format string, style *color.Style) (colorized string) {
	reg, err := regexp.Compile("{{(.*?)}}")
	if err != nil {
		panic(err)
	}
	colorized = reg.ReplaceAllString(format, style.Sprint("$1"))
	return
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Infof(format string, v ...interface{}) {
	format = replace(format, &infoColor)
	infoLogger.Printf(format, v...)
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Warnf(format string, v ...interface{}) {
	format = replace(format, &infoColor)
	warnLogger.Printf(format, v...)
}

// Use it as log.Printf, and wrap the string to be colorized with "{{" and "}}"
func Errorf(format string, v ...interface{}) {
	format = replace(format, &errorColor)
	errorLogger.Printf(format, v...)
}
