package colorize

import "github.com/gookit/color"

type Style color.Style

var (
	Info  = Style(color.New(color.FgGreen))
	Warn  = Style(color.New(color.FgRed, color.OpBold))
	Error = Style(color.New(color.FgRed))

	Name    = Style(color.New(color.FgCyan, color.OpBold))
	Version = Style(color.New(color.FgYellow))
	//Emphasis = Style(color.New(color.FgGreen, color.OpUnderscore))
)

func (c Style) Sprint(a ...interface{}) string {
	return color.Style(c).Sprint(a...)
}
