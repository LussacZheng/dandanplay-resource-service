use chrono::{TimeZone, Utc};
use html_scraper::{ElementRef, Html, Selector};
use log::{error, trace};

use super::Scraper;
#[cfg(feature = "search-option")]
use crate::model::search_option::SearchOptions;
use crate::model::{Item, List, ListQuery, Resource, UNKNOWN_SUBGROUP_ID, UNKNOWN_TYPE_ID};
use crate::util::{ElementRefExt, ToInt};

/// Base URL of "dmhy".
const BASE: &str = "https://share.dmhy.org";
/// Maximum number of the search results returned by "dmhy".
const MAX_SIZE: usize = 80;

/// URL of the web page for extracting list.
#[inline]
fn _list_url(query: &ListQuery) -> String {
    format!(
        "https://share.dmhy.org/topics/list/page/{page}?keyword={keyword}&sort_id={sort}&team_id={team}&order=date-desc",
        page = query.page,
        keyword = query.keyword,
        sort = query.sort,
        team = query.team
    )
}

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
                sort: css_selector("select#AdvSearchSort option[value]")?,
                team: css_selector("select#AdvSearchTeam option[value]")?,
                has_more: css_selector("div.nav_title>div.fl a:last-child")?,
                resource: css_selector("table#topic_list tbody tr")?,
                title_and_subgroup: css_selector("td:nth-child(3) a")?,
                type_id_and_name: css_selector("td:nth-child(2) a[href][class]")?,
                magnet: css_selector("td:nth-child(4) a[href]")?,
                file_size: css_selector("td:nth-child(5)")?,
                publish_date: css_selector("td:nth-child(1) span")?,
            },
        })
    }
}

impl Scraper for Dmhy {
    const TYPE_URL: &'static str =
        "https://share.dmhy.org/topics/advanced-search?team_id=0&sort_id=0&orderby=";
    const SUBGROUP_URL: &'static str = Self::TYPE_URL;

    #[cfg(not(feature = "search-option"))]
    fn list_url(query: &ListQuery) -> String {
        _list_url(query)
    }

    #[cfg(feature = "search-option")]
    fn list_urls(query: &ListQuery, search_options: &SearchOptions) -> Vec<String> {
        let mut urls = vec![_list_url(query)];
        if search_options.options.realtime > 0 {
            urls.push(format!(
                "https://share.dmhy.org/topics/list/page/{}",
                search_options.options.realtime
            ));
        }
        urls
    }

    fn extract_types(&self, html: String) -> Option<Vec<Item>> {
        select_or_default(&html, &self.selectors.sort, UNKNOWN_TYPE_ID)
    }

    fn extract_subgroups(&self, html: String) -> Option<Vec<Item>> {
        select_or_default(&html, &self.selectors.team, UNKNOWN_SUBGROUP_ID)
    }

    #[cfg(not(feature = "search-option"))]
    fn extract_list(&self, html: String) -> Option<List> {
        let mut result = List {
            has_more: false,
            resources: Vec::with_capacity(MAX_SIZE),
        };

        let document = Html::parse_document(&html);

        result.has_more = self.extract_has_more_from_document(&document);

        for element in document.select(&self.selectors.resource) {
            result
                .resources
                .push(self.extract_resource_from_element(element));
        }

        Some(result)
    }

    #[cfg(feature = "search-option")]
    fn extract_list(
        &self,
        htmls: Vec<String>,
        query: ListQuery,
        search_options: SearchOptions,
    ) -> Option<List> {
        let capacity = if search_options.options.limit >= MAX_SIZE {
            MAX_SIZE
        } else {
            search_options.options.limit
        };

        let mut result = List {
            has_more: false,
            resources: Vec::with_capacity(capacity),
        };

        let mut unique_set = std::collections::HashSet::with_capacity(capacity);

        let document = Html::parse_document(&htmls[0]);

        result.has_more = self.extract_has_more_from_document(&document);

        for element in document.select(&self.selectors.resource) {
            if result.resources.len() >= search_options.options.limit {
                break;
            }
            let resource = self.extract_resource_from_element(element);
            unique_set.insert(resource.page_url.clone().unwrap_or_default());
            result.resources.push(resource);
        }

        // Extract extra `Resource`s from HTML text, for the search-option `$realtime`.
        if search_options.options.realtime > 0 {
            let mut extra_resources = Vec::new();
            let document_realtime = Html::parse_document(&htmls[1]);

            'outer: for element in document_realtime.select(&self.selectors.resource) {
                let resource = self.extract_resource_from_element(element);

                // Continue Early! Therefore, we compare them in order of complexity:
                //   `team` or `sort` < existence <<< keyword

                // is-subgroup-not-matched
                //   tips:
                //     - an unknown subgroup_id (`None`) also means not-matched
                //     - `-1_i16 as u16 == 65535_u16`, but it's ok here.
                if query.team != 0 && resource.subgroup_id.unwrap_or_default() as u16 != query.team
                {
                    continue;
                }
                // is-type-not-matched
                if query.sort != 0 && resource.type_id.unwrap_or_default() as u16 != query.sort {
                    continue;
                }
                // is-duplicated
                if let Some(page_url) = &resource.page_url {
                    if unique_set.contains(page_url) {
                        // dbg!(page_url);
                        continue;
                    }
                }
                // is-keyword-not-matched
                if let Some(title) = &resource.title {
                    for word in search_options.keyword.split_whitespace() {
                        // dbg!(title);
                        if !crate::util::contains_insensitive(title, word) {
                            continue 'outer;
                        }
                    }
                }

                // Now we can be sure that `result.resources` doesn't contain this `resource`.
                // But it is not necessary to:
                //   unique_set.insert(resource.page_url.clone().unwrap_or_default());
                extra_resources.push(resource);
            }

            log::debug!(
                "a total of {} `$realtime` resources were found",
                extra_resources.len()
            );

            extra_resources.append(&mut result.resources);
            extra_resources.truncate(search_options.options.limit);
            result.resources = extra_resources;
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

impl Dmhy {
    /// Extract `List.has_more` info from a HTML `document`.
    #[inline]
    fn extract_has_more_from_document(&self, document: &Html) -> bool {
        if let Some(anchor) = document.select(&self.selectors.has_more).next() {
            // dbg!(anchor.html());
            anchor.inner_html().contains("下一頁")
        } else {
            false
        }
    }

    /// Extract `Resource` info from a single HTML `element`.
    fn extract_resource_from_element(&self, element: ElementRef) -> Resource {
        // When len is 2, it means there is a team/subgroup for this resource.
        // When len is 1, it means there is no team/subgroup.
        let mut title_and_subgroup = element.select(&self.selectors.title_and_subgroup);
        let subgroup_or_title = title_and_subgroup.next();
        let maybe_a_title = title_and_subgroup.next();

        let (title, page_url, subgroup_id, subgroup_name) = match (subgroup_or_title, maybe_a_title)
        {
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

        let (type_id, type_name) = match element.select(&self.selectors.type_id_and_name).next() {
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
        let magnet = element
            .select(&self.selectors.magnet)
            .next()
            .and_then(|anchor_magnet| anchor_magnet.value().attr("href"));

        let file_size = element
            .select(&self.selectors.file_size)
            .next()
            .map(|td| td.inner_text());

        let publish_date = element
            .select(&self.selectors.publish_date)
            .next()
            .and_then(|span| {
                Utc.datetime_from_str(&span.inner_text(), "%Y/%m/%d %H:%M")
                    .ok()
            })
            .map(|date| date.format("%Y-%m-%d %H:%M:%S").to_string());

        Resource {
            title: title.map(|s| s.trim().to_string()),
            type_id,
            type_name: type_name.map(|s| s.trim().to_string()),
            subgroup_id,
            subgroup_name: subgroup_name.map(|s| s.trim().to_string()),
            magnet: magnet.map(|s| s.to_string()),
            page_url: page_url.map(|s| format!("{}{}", BASE, s)),
            file_size,
            publish_date,
        }
    }
}

/// Create a CSS selector from str.
#[inline]
fn css_selector(s: &str) -> Option<Selector> {
    match Selector::parse(s) {
        Ok(v) => Some(v),
        Err(e) => {
            error!("{:?}", e);
            None
        }
    }
}
