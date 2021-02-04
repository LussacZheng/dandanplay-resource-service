package colorize

import "github.com/gookit/color"

type colorStyle color.Style

var (
	Info  = colorStyle(color.New(color.FgGreen))
	Warn  = colorStyle(color.New(color.FgRed, color.OpBold))
	Error = colorStyle(color.New(color.FgRed))

	Name     = colorStyle(color.New(color.FgCyan, color.OpBold))
	Version  = colorStyle(color.New(color.FgYellow))
	Emphasis = colorStyle(color.New(color.FgGreen, color.OpUnderscore))
)

func (c colorStyle) Sprint(a ...interface{}) string {
	return color.Style(c).Sprint(a...)
}
