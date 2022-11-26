pub mod request;

/// Extension trait for parsing a string into integer.
pub(crate) trait ToInt {
    type Int;

    /// Parse a string into an integer.
    fn to_int(&self) -> Option<Self::Int>;

    /// Splits the string on the last occurrence of the specified delimiter,
    /// and then parse the suffix after delimiter into an integer.
    fn rsplit_then_to_int(&self, delimiter: char) -> Option<Self::Int>;

    /// Parse the substring after the prefix into an integer.
    fn strip_prefix_then_to_int(&self, prefix: &str) -> Option<Self::Int>;
}

impl ToInt for Option<&str> {
    type Int = i16;

    #[inline]
    fn to_int(&self) -> Option<i16> {
        self.and_then(|s| s.parse().ok())
    }

    #[inline]
    fn rsplit_then_to_int(&self, delimiter: char) -> Option<i16> {
        self.and_then(|s| s.rsplit_once(delimiter))
            .and_then(|(_, s)| s.parse().ok())
    }

    #[inline]
    fn strip_prefix_then_to_int(&self, prefix: &str) -> Option<i16> {
        self.and_then(|s| s.strip_prefix(prefix)).to_int()
    }
}

/// Extension trait for [`ElementRef`](html_scraper::ElementRef).
pub(crate) trait ElementRefExt {
    /// Returns the inner text of this element.
    fn inner_text(&self) -> String;
}

impl ElementRefExt for html_scraper::ElementRef<'_> {
    #[inline]
    fn inner_text(&self) -> String {
        self.text().collect()
    }
}

/// Returns whether the given `sub` matches a sub-slice of the string `s`.
///
/// **Case Insensitive.**
#[cfg(all(feature = "search-option", not(feature = "search-option-t2s")))]
#[inline]
pub fn contains_insensitive(s: &str, sub: &str) -> bool {
    s.to_ascii_lowercase().contains(&sub.to_ascii_lowercase())
}

/// Returns whether the given `sub` matches a sub-slice of the string `s`.
///
/// **Case Insensitive; Simplified or Traditional Chinese Characters Insensitive.**
#[cfg(all(feature = "search-option", feature = "search-option-t2s"))]
#[inline]
pub fn contains_insensitive(s: &str, sub: &str) -> bool {
    use character_converter::traditional_to_simplified as t2s;
    t2s(s)
        .to_ascii_lowercase()
        .contains(&t2s(sub).to_ascii_lowercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn option_str_to_int() {
        assert_eq!(Some("007").to_int(), Some(7));
        assert_eq!(Some("-007").to_int(), Some(-7));
        assert_eq!(Some("1.2").to_int(), None);
        assert_eq!(None.to_int(), None);

        let str = Some("sort/-01230");
        let split_patterns = ['-', '/', '3', 't', '?'];
        let strip_patterns = ["sort/-", "sort/", "sort/-0123", "sort", "unknown"];
        let expectations = [Some(1230), Some(-1230), Some(0), None, None, None];

        for (delimiter, expected) in split_patterns.into_iter().zip(expectations) {
            assert_eq!(str.rsplit_then_to_int(delimiter), expected);
        }
        assert_eq!(None.rsplit_then_to_int('-'), None);

        for (prefix, expected) in strip_patterns.into_iter().zip(expectations) {
            assert_eq!(str.strip_prefix_then_to_int(prefix), expected);
        }
        assert_eq!(None.strip_prefix_then_to_int("-"), None);
    }

    #[test]
    fn element_inner_text() {
        use html_scraper::{Html, Selector};

        let html = Html::parse_fragment(r"<div> <p> <span>hello</span> <a>world</a> </p> </div>");
        let p = html.select(&Selector::parse("p").unwrap()).next().unwrap();
        assert_eq!(p.inner_html(), " <span>hello</span> <a>world</a> ");
        assert_eq!(p.inner_text(), " hello world ")
    }

    #[test]
    fn str_contains() {
        let str = "Lorem ipsum dolor sit amet, CONSECTETUR ADIPISCING ELIT.\
            滚滚长江东逝水，浪花淘尽英雄。是非成敗轉頭空，青山依舊在，幾度夕陽紅。";

        #[cfg(all(feature = "search-option", not(feature = "search-option-t2s")))]
        {
            let matched = [
                "lOREM",
                "IPSUM DOLOR SIT AMET",
                "consectetur adipiscing elit",
                "滚滚长江东逝水",
                "是非成敗轉頭空",
            ];
            let mismatched = ["浪花淘盡英雄", "青山依旧在，几度夕阳红"];

            for word in matched {
                assert!(contains_insensitive(str, word), "NOT contains: `{}`", word);
            }
            for word in mismatched {
                assert!(
                    !contains_insensitive(str, word),
                    "expect NOT but contains: `{}`",
                    word
                );
            }
        }

        #[cfg(all(feature = "search-option", feature = "search-option-t2s"))]
        {
            let matched = [
                "lOREM",
                "IPSUM DOLOR SIT AMET",
                "consectetur adipiscing elit",
                "滾滾長江東逝水",
                "浪花淘盡英雄",
                "是非成败转头空，青山依旧在，几度夕阳红",
            ];

            for word in matched {
                assert!(contains_insensitive(str, word), "NOT contains: `{}`", word);
            }
        }
    }
}
