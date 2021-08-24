package api

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

const (
	plainStr         = " fate stay night "
	complexStr       = "$page:3  fate stay $realtime $realtime:-1 $realtime:1.5 $reverse  $limit:500 $limIt:20 $n$ig$$ht$ $$abc $$efg:2 $ $中文指令 $sorted $limit $page:005"
	wantedComplexStr = "  fate stay $realtime:-1 $realtime:1.5  $limIt:20 $n$ig$ht$ $abc $efg:2 $ $中文指令"
)

func TestParseSearchOperator(t *testing.T) {
	a := assert.New(t)

	// No given options
	{
		keyword, optMap := parseSearchOperator(plainStr)
		a.Equal(plainStr, keyword)
		a.Equal(optionMap{}, optMap)

		so := newSearchOptions(plainStr)
		a.Equal(plainStr, so.Keyword)
		a.Equal(option{
			Realtime: 0,
			Page:     1,
			Limit:    200,
		}, *so.Options)
	}

	// Zero-value testing
	{
		str := " fate stay $realtime:0 $page:0 $limit:0 night "

		keyword, optMap := parseSearchOperator(str)
		a.Equal(plainStr, keyword)
		a.Equal(optionMap{
			"realtime": 0,
			"page":     0,
			"limit":    0,
		}, optMap)

		so := newSearchOptions(str)
		a.Equal(plainStr, so.Keyword)
		a.Equal(option{
			Realtime: 0,
			Page:     1,
			Limit:    200,
		}, *so.Options)
	}

	// Item-by-item testing: $realtime
	{
		{
			str := " fate stay $realtime night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"realtime": 1,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 1,
				Page:     1,
				Limit:    200,
			}, *so.Options)
		}
		{
			str := " fate stay $realtime:2 night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"realtime": 2,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 2,
				Page:     1,
				Limit:    200,
			}, *so.Options)
		}
	}

	// Item-by-item testing: $page
	{
		{
			str := " fate stay $page night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"page": 1,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 0,
				Page:     1,
				Limit:    200,
			}, *so.Options)
		}
		{
			str := " fate stay $page:3 night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"page": 3,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 0,
				Page:     3,
				Limit:    200,
			}, *so.Options)
		}
	}

	// Item-by-item testing: $limit
	{
		{
			str := " fate stay $limit night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"limit": 80,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 0,
				Page:     1,
				Limit:    80,
			}, *so.Options)
		}
		{
			str := " fate stay $limit:50 night "

			keyword, optMap := parseSearchOperator(str)
			a.Equal(plainStr, keyword)
			a.Equal(optionMap{
				"limit": 50,
			}, optMap)

			so := newSearchOptions(str)
			a.Equal(plainStr, so.Keyword)
			a.Equal(option{
				Realtime: 0,
				Page:     1,
				Limit:    50,
			}, *so.Options)
		}
	}

	// Parse complex string
	{
		keyword, optMap := parseSearchOperator(complexStr)
		a.Equal(wantedComplexStr, keyword)
		a.Equal(optionMap{
			"page":     5,
			"realtime": 1,
			"reverse":  1,
			"limit":    80,
			"sorted":   1,
		}, optMap)

		so := newSearchOptions(complexStr)
		a.Equal(wantedComplexStr, so.Keyword)
		a.Equal(option{
			Realtime: 1,
			Page:     5,
			Limit:    80,
		}, *so.Options)
	}
}
