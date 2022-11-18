use std::collections::HashMap;

use fancy_regex::{Captures, Regex};
use log::debug;
use once_cell::sync::Lazy;

/// A reusable regular expression for capturing search-options.
static RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?: |^)\$([a-z]+)(?::(\d+))?(?=\s|$)").expect("failed to compile a regex")
});

/// Contains a keyword and some search-options parsed from `search_str`.
#[derive(Debug)]
pub(crate) struct SearchOptions {
    pub(crate) keyword: String,
    pub(crate) options: Options,
}

/// Contains all the supported search-options.
#[derive(Debug, PartialEq)]
pub(crate) struct Options {
    pub(crate) realtime: usize,
    pub(crate) page: usize,
    pub(crate) limit: usize,
}

impl SearchOptions {
    /// Parse the `search_str` to get the keyword and search-options.
    pub(crate) fn new(search_str: &str) -> Self {
        let (keyword, option_map) = parse_search_operator(search_str);
        let res = Self {
            keyword,
            options: Options::from_iter(option_map),
        };
        debug!("parsed {:?}", res);
        res
    }
}

/// Extract the keyword and search-options from the `search_str`.
fn parse_search_operator(search_str: &str) -> (String, HashMap<String, usize>) {
    let mut map = HashMap::new();

    let keyword = RE.replace_all(search_str, |caps: &Captures| {
        let option_name = match caps.get(1).map(|mat| mat.as_str()) {
            Some(s) => s,
            None => return "",
        };
        let option_value = caps
            .get(2)
            .map(|mat| mat.as_str())
            .and_then(|s| s.parse().ok())
            .unwrap_or_else(|| Options::unassigned(option_name));
        map.insert(option_name.to_string(), option_value);
        ""
    });

    (keyword.replace("$$", "$"), map)
}

/// Defines some default values for `Options` in different situations.
impl Options {
    /// Default value when there is no search-options in `search_str`.
    ///
    /// a.k.a the impl of `Default` trait.
    fn unused() -> Self {
        Self {
            realtime: 0,
            page: 1,
            limit: 200,
        }
    }

    /// Default value when using a search-option in the format of "`$option`".
    /// (no assigned value)
    fn unassigned(option_name: &str) -> usize {
        match option_name {
            "realtime" => 1,
            "page" => 1,
            "limit" => 80,
            _ => Self::undefined(),
        }
    }

    /// As described in the specification of search-options,
    /// undefined or mis-spelled commands will be (assigned with `1` and) ignored,
    /// which will not take effect.
    #[inline]
    fn undefined() -> usize {
        1
    }
}

impl<S: AsRef<str>> FromIterator<(S, usize)> for Options {
    /// Construct `Options` from an options map.
    fn from_iter<T: IntoIterator<Item = (S, usize)>>(iter: T) -> Self {
        let mut result = Options::unused();
        for (option_name, option_value) in iter {
            // If `option_value` is 0, it is ignored
            // according to the specification of search-options.
            if option_value != 0 {
                match option_name.as_ref() {
                    "realtime" => result.realtime = option_value,
                    "page" => result.page = option_value,
                    "limit" => result.limit = option_value,
                    // Not a valid option is fine, the default value has been set above.
                    _ => {}
                }
            }
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Covert a `Iterator<&str, usize>` into `HashMap<String, usize>`.
    fn map<'a, T: IntoIterator<Item = (&'a str, usize)>>(iter: T) -> HashMap<String, usize> {
        let mut map = HashMap::new();
        for (k, v) in iter {
            map.insert(k.to_string(), v);
        }
        map
    }

    const PLAIN_STR: &str = " fate stay night ";

    #[test]
    fn no_given_options() {
        let (keyword, options) = parse_search_operator(PLAIN_STR);
        assert_eq!(keyword, PLAIN_STR);
        assert!(options.is_empty());

        let so = SearchOptions::new(PLAIN_STR);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 1,
                limit: 200,
            }
        );
    }

    #[test]
    fn zero_value_testing() {
        let str = " fate stay $realtime:0 $page:0 $limit:0 night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("realtime", 0), ("page", 0), ("limit", 0)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 1,
                limit: 200,
            }
        );
    }

    #[test]
    fn item_by_item_testing_realtime() {
        let str = " fate stay $realtime night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("realtime", 1)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 1,
                page: 1,
                limit: 200,
            }
        );

        let str = " fate stay $realtime:2 night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("realtime", 2)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 2,
                page: 1,
                limit: 200,
            }
        );
    }

    #[test]
    fn item_by_item_testing_page() {
        let str = " fate stay $page night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("page", 1)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 1,
                limit: 200,
            }
        );

        let str = " fate stay $page:3 night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("page", 3)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 3,
                limit: 200,
            }
        );
    }

    #[test]
    fn item_by_item_testing_limit() {
        let str = " fate stay $limit night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("limit", 80)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 1,
                limit: 80,
            }
        );

        let str = " fate stay $limit:50 night ";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, PLAIN_STR);
        assert_eq!(options, map([("limit", 50)]));

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, PLAIN_STR);
        assert_eq!(
            so.options,
            Options {
                realtime: 0,
                page: 1,
                limit: 50,
            }
        );
    }

    #[test]
    fn parse_complex_string() {
        let str =
            "$page:3  fate stay $realtime $realtime:-1 $realtime:1.5 $reverse  $limit:500 $limIt:20 $n$ig$$ht$ $$abc $$efg:2 $ $中文指令 $sorted $limit $page:005";
        let wanted =
            "  fate stay $realtime:-1 $realtime:1.5  $limIt:20 $n$ig$ht$ $abc $efg:2 $ $中文指令";

        let (keyword, options) = parse_search_operator(str);
        assert_eq!(keyword, wanted);
        assert_eq!(
            options,
            map([
                ("page", 5),
                ("realtime", 1),
                ("reverse", 1),
                ("limit", 80),
                ("sorted", 1),
            ])
        );

        let so = SearchOptions::new(str);
        assert_eq!(so.keyword, wanted);
        assert_eq!(
            so.options,
            Options {
                realtime: 1,
                page: 5,
                limit: 80,
            }
        );
    }
}
