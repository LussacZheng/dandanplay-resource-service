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
