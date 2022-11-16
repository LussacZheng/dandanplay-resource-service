use chrono::{TimeZone, Utc};
use html_scraper::{Html, Selector};
use log::trace;

use super::Scraper;
use crate::model::{Item, List, ListQuery, Resource, UNKNOWN_SUBGROUP_ID, UNKNOWN_TYPE_ID};
use crate::util::{ElementRefExt, ToInt};

const BASE: &str = "https://share.dmhy.org";

/// A `Scraper` for "share.dmhy.org".
pub(crate) struct Dmhy {
    /// Used to store a series of CSS selectors. (Parse once, easily reuse.)
    selectors: Selectors,
}

/// A set of reusable [`CSS Selector`](html_scraper::Selector)s.
struct Selectors {
    sort: Selector,
    team: Selector,
    has_more: Selector,
    resource: Selector,
    title_and_subgroup: Selector,
    type_id_and_name: Selector,
    magnet: Selector,
    file_size: Selector,
    publish_date: Selector,
}

impl Dmhy {
    /// Returns an instance of [`Dmhy`] Scraper for constructing a `Provider`.
    pub(crate) fn new() -> Option<Self> {
        trace!("create Scraper 'dmhy' with CSS selectors");
        Some(Self {
            selectors: Selectors {
                sort: Selector::parse("select#AdvSearchSort option[value]").ok()?,
                team: Selector::parse("select#AdvSearchTeam option[value]").ok()?,
                has_more: Selector::parse("div.nav_title>div.fl a").ok()?,
                resource: Selector::parse("table#topic_list tbody tr").ok()?,
                title_and_subgroup: Selector::parse("td:nth-child(3) a").ok()?,
                type_id_and_name: Selector::parse("td:nth-child(2) a[href][class]").ok()?,
                magnet: Selector::parse("td:nth-child(4) a[href]").ok()?,
                file_size: Selector::parse("td:nth-child(5)").ok()?,
                publish_date: Selector::parse("td:nth-child(1) span").ok()?,
            },
        })
    }
}

impl Scraper for Dmhy {
    const TYPE_URL: &'static str =
        "https://share.dmhy.org/topics/advanced-search?team_id=0&sort_id=0&orderby=";
    const SUBGROUP_URL: &'static str = Self::TYPE_URL;

    fn list_query_formatter(query: &ListQuery) -> String {
        format!(
            "https://share.dmhy.org/topics/list/page/{page}?keyword={keyword}&sort_id={sort}&team_id={team}&order=date-desc",
            page = query.page,
            keyword = query.keyword,
            sort = query.sort,
            team = query.team
        )
    }

    fn extract_types(&self, html: String) -> Option<Vec<Item>> {
        select_or_default(&html, &self.selectors.sort, UNKNOWN_TYPE_ID)
    }

    fn extract_subgroups(&self, html: String) -> Option<Vec<Item>> {
        select_or_default(&html, &self.selectors.team, UNKNOWN_SUBGROUP_ID)
    }

    fn extract_list(&self, html: String) -> Option<List> {
        let mut result = List {
            has_more: false,
            resources: Vec::with_capacity(80),
        };

        let document = Html::parse_document(&html);

        if let Some(anchor) = document.select(&self.selectors.has_more).next() {
            result.has_more = anchor.inner_html().contains("下一頁")
        }

        for resource in document.select(&self.selectors.resource) {
            // When len is 2, it means there is a team/subgroup for this resource.
            // When len is 1, it means there is no team/subgroup.
            let mut title_and_subgroup = resource.select(&self.selectors.title_and_subgroup);
            let subgroup_or_title = title_and_subgroup.next();
            let maybe_a_title = title_and_subgroup.next();

            let (title, page_url, subgroup_id, subgroup_name) =
                match (subgroup_or_title, maybe_a_title) {
                    (Some(anchor_subgroup), Some(anchor_title)) => (
                        Some(anchor_title.inner_text()),
                        anchor_title.value().attr("href"),
                        anchor_subgroup.value().attr("href").rsplit_then_to_int('/'),
                        Some(anchor_subgroup.inner_text()),
                    ),
                    (Some(anchor_title), None) => (
                        Some(anchor_title.inner_text()),
                        anchor_title.value().attr("href"),
                        None,
                        None,
                    ),
                    (None, _) => (None, None, None, None),
                };

            let (type_id, type_name) =
                match resource.select(&self.selectors.type_id_and_name).next() {
                    Some(anchor_type) => (
                        anchor_type
                            .value()
                            .attr("class")
                            .strip_prefix_then_to_int("sort-"),
                        Some(anchor_type.inner_text()),
                    ),
                    None => (None, None),
                };

            // TODO: Sometimes there are too much Tracker URL (`&tr=`) in the magnet link,
            //   should we remove these redundant part? Only keep up to 50 links?
            //   e.g. try to search "The Fate of the Furious"
            let magnet = resource
                .select(&self.selectors.magnet)
                .next()
                .and_then(|anchor_magnet| anchor_magnet.value().attr("href"));

            let file_size = resource
                .select(&self.selectors.file_size)
                .next()
                .map(|td| td.inner_text());

            let publish_date = resource
                .select(&self.selectors.publish_date)
                .next()
                .and_then(|span| {
                    Utc.datetime_from_str(&span.inner_text(), "%Y/%m/%d %H:%M")
                        .ok()
                })
                .map(|date| date.format("%Y-%m-%d %H:%M:%S").to_string());

            result.resources.push(Resource {
                title: title.map(|s| s.trim().to_string()),
                type_id,
                type_name: type_name.map(|s| s.trim().to_string()),
                subgroup_id,
                subgroup_name: subgroup_name.map(|s| s.trim().to_string()),
                magnet: magnet.map(|s| s.to_string()),
                page_url: page_url.map(|s| format!("{BASE}{s}")),
                file_size,
                publish_date,
            })
        }

        Some(result)
    }
}

/// Search for `html` using the provided CSS `selector` and return the captured data.
/// If some of the elements are not found, they are given the `default` value provided.
///
/// This function will not fail actually, returning `Option` just to satisfy the signature
/// of the trait [`Scraper`].
fn select_or_default(html: &str, selector: &Selector, default: i16) -> Option<Vec<Item>> {
    let mut result = Vec::new();

    let document = Html::parse_fragment(html);
    for element in document.select(selector) {
        result.push(Item {
            id: element.value().attr("value").to_int().unwrap_or(default),
            name: element.inner_text(),
        })
    }

    Some(result)
}
