mod meta;
#[cfg(feature = "search-option")]
pub(crate) mod search_option;

pub(crate) use self::meta::MetaInfo;

use serde::{ser::SerializeStruct, Deserialize, Deserializer, Serialize, Serializer};

/// Return a predefined special value if certain fields failed to parse.
///
/// Note: These "predefined special values" are not officially defined by dandanplay.
///       Just some temporary placeholders.
const UNKNOWN_TITLE: &str = "未能成功解析标题";
pub(crate) const UNKNOWN_TYPE_ID: i16 = -2;
const UNKNOWN_TYPE_NAME: &str = "未能成功解析类别";
pub(crate) const UNKNOWN_SUBGROUP_ID: i16 = -1;
const UNKNOWN_SUBGROUP_NAME: &str = "未知字幕组";
/// If some expired resource didn't provide the magnet link,
///   only by returning the string with certain format (with prefix "magnet"),
/// can the `java.lang.StringIndexOutOfBoundsException` on Android client be avoided.
///
/// For example, try to search "你好安妮"
const UNKNOWN_MAGNET: &str = "magnet_not_found_未能成功解析磁力链接或磁力链接不存在";
const UNKNOWN_PAGE_URL: &str = "未能成功解析资源发布页面";
const UNKNOWN_FILE_SIZE: &str = "未能成功解析资源大小";
const UNKNOWN_PUBLISH_DATE: &str = "1970-01-01 08:00:00";

/// Team (subgroup) or Sort (type)
#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Item {
    pub(crate) id: i16,
    pub(crate) name: String,
}

/// Anime resource
///
/// (with a customized implementation of `Serialize`)
pub(crate) struct Resource {
    pub(crate) title: Option<String>,
    pub(crate) type_id: Option<i16>,
    pub(crate) type_name: Option<String>,
    pub(crate) subgroup_id: Option<i16>,
    pub(crate) subgroup_name: Option<String>,
    pub(crate) magnet: Option<String>,
    /// `page_url` is equivalent to the unique ID of a `Resource`,
    /// which is more suitable as an identifier than `title`.
    pub(crate) page_url: Option<String>,
    pub(crate) file_size: Option<String>,
    pub(crate) publish_date: Option<String>,
}

/// Used in `impl Serialize for Resource`
const RESOURCE_STRUCT_NAME: &str = "Resource";
/// Used in `impl Serialize for Resource`
const RESOURCE_FIELDS_COUNT: usize = 9;

/// Return struct of route "`/type`".
#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Types {
    pub(crate) types: Vec<Item>,
}

/// Return struct of route "`/subgroup`".
#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Subgroups {
    pub(crate) subgroups: Vec<Item>,
}

/// Return struct of route "`/list`".
#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct List {
    pub(crate) has_more: bool,
    pub(crate) resources: Vec<Resource>,
}

/// `ListQuery` stores the received QueryString from route `/list`.
///
/// `/list?keyword={str}&subgroup={uint}&type={uint}&r={str}&page={uint}`
#[derive(Deserialize, Debug)]
pub(crate) struct ListQuery {
    #[serde(default)]
    pub(crate) keyword: String,

    #[serde(rename = "subgroup")]
    #[serde(default)]
    #[serde(deserialize_with = "serde_helper::ok_or_default")]
    pub(crate) team: u16,

    #[serde(rename = "type")]
    #[serde(default)]
    #[serde(deserialize_with = "serde_helper::ok_or_default")]
    pub(crate) sort: u16,

    #[serde(rename = "r")]
    /// This field won't be using for a while, so we don't need to construct an empty `String`.
    /// Leave it as `None` if not in QueryString.
    _random: Option<String>,

    #[serde(default)]
    #[serde(deserialize_with = "serde_helper::ok_or_default")]
    pub(crate) page: Page,
}

#[derive(Deserialize, Debug)]
pub(crate) struct Page(pub(crate) usize);

mod serde_helper {
    use super::*;

    /// Deserializes default value when error.
    /// https://github.com/serde-rs/serde/issues/1098#issuecomment-760711617
    pub(super) fn ok_or_default<'de, T, D>(deserializer: D) -> Result<T, D::Error>
    where
        T: Deserialize<'de> + Default,
        D: Deserializer<'de>,
    {
        Ok(T::deserialize(deserializer).unwrap_or_default())
    }

    impl Default for Page {
        /// Since the default value of `usize` is 0,
        /// we need to change the default value of [`Page`] to 1.
        fn default() -> Self {
            Page(1)
        }
    }

    impl std::fmt::Display for Page {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{}", self.0)
        }
    }

    impl Serialize for Resource {
        /// Fills the `None` fields with predefined values when serializing.
        ///
        /// ref: https://serde.rs/impl-serialize.html
        fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            let mut state =
                serializer.serialize_struct(RESOURCE_STRUCT_NAME, RESOURCE_FIELDS_COUNT)?;

            state.serialize_field("Title", &self.title.as_deref().unwrap_or(UNKNOWN_TITLE))?;
            state.serialize_field("TypeId", &self.type_id.unwrap_or(UNKNOWN_TYPE_ID))?;
            state.serialize_field(
                "TypeName",
                &self.type_name.as_deref().unwrap_or(UNKNOWN_TYPE_NAME),
            )?;
            state.serialize_field(
                "SubgroupId",
                &self.subgroup_id.unwrap_or(UNKNOWN_SUBGROUP_ID),
            )?;
            state.serialize_field(
                "SubgroupName",
                &self
                    .subgroup_name
                    .as_deref()
                    .unwrap_or(UNKNOWN_SUBGROUP_NAME),
            )?;
            state.serialize_field(
                "Magnet",
                match self.magnet.as_deref() {
                    Some("") => UNKNOWN_MAGNET,
                    Some(s) => s,
                    None => UNKNOWN_MAGNET,
                },
            )?;
            state.serialize_field(
                "PageUrl",
                &self.page_url.as_deref().unwrap_or(UNKNOWN_PAGE_URL),
            )?;
            state.serialize_field(
                "FileSize",
                &self.file_size.as_deref().unwrap_or(UNKNOWN_FILE_SIZE),
            )?;
            state.serialize_field(
                "PublishDate",
                &self.publish_date.as_deref().unwrap_or(UNKNOWN_PUBLISH_DATE),
            )?;

            state.end()
        }
    }
}
