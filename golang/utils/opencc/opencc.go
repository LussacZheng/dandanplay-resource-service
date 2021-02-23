package opencc

import "github.com/go-creed/sat"

var converter = sat.DefaultDict()

// T2S converts Traditional Chinese to Simplified Chinese
func T2S(s string) string {
	return converter.Read(s)
}
