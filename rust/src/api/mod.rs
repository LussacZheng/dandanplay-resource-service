mod dmhy;

pub(crate) use self::dmhy::Dmhy;

use actix_web::web::{Json, Query};
use log::{debug, trace};
use reqwest::{Client, Proxy};

#[cfg(feature = "search-option")]
use crate::model::search_option::SearchOptions;
use crate::model::{Item, List, ListQuery, Subgroups, Types};
use crate::util::request::{request_html, USER_AGENT};

/// `Scraper` defines the functions what a `Provider.scraper` should implement,
/// that is, how to extract resource information from (Provider-given) HTML string.
///
/// The `Scraper` does not need to consider how to obtain the web page (HTML).
pub(crate) trait Scraper {
    /// URL of the web page for extracting types.
    const TYPE_URL: &'static str;
    /// URL of the web page for extracting subgroups.
    const SUBGROUP_URL: &'static str;

    /// Construct the `LIST_URL` from the value of `ListQuery`,
    /// pointing to the web page where the list is extracted.
    ///
    /// Similar to [`TYPE_URL`](Scraper::TYPE_URL) and [`SUBGROUP_URL`](Scraper::SUBGROUP_URL).
    #[cfg(not(feature = "search-option"))]
    fn list_url(query: &ListQuery) -> String;

    /// Construct some `LIST_URL` from the values of `ListQuery` and `SearchOptions`,
    /// pointing to the web pages where the list is extracted.
    ///
    /// Similar to [`TYPE_URL`](Scraper::TYPE_URL) and [`SUBGROUP_URL`](Scraper::SUBGROUP_URL).
    #[cfg(feature = "search-option")]
    fn list_urls(query: &ListQuery, search_options: &SearchOptions) -> Vec<String>;

    /// Extract an array of [`Type Item`](crate::model::Types) from `html` string.
    fn extract_types(&self, html: String) -> Option<Vec<Item>>;

    /// Extract an array of [`Subgroup Item`](crate::model::Subgroups) from `html` string.
    fn extract_subgroups(&self, html: String) -> Option<Vec<Item>>;

    /// Extract a [`List`](crate::model::List) from `html` string.
    #[cfg(not(feature = "search-option"))]
    fn extract_list(&self, html: String) -> Option<List>;

    /// Extract a [`List`](crate::model::List) from a vector of `html` strings,
    /// according to `ListQuery` and `SearchOptions`.
    ///
    /// `htmls` definitely be in one-to-one correspondence with the `urls`
    /// given by [`list_urls`](Scraper::list_urls).
    #[cfg(feature = "search-option")]
    fn extract_list(
        &self,
        htmls: Vec<String>,
        query: ListQuery,
        search_options: SearchOptions,
    ) -> Option<List>;
}

/// A `Provider` defines the route scope and its scraper.
///
/// `Provider` with any type that implements [`Scraper`] can be registered in the main App.
///
/// - **To add a new [`Provider`], you just need to add a new type which implements [`Scraper`].**
pub(crate) struct Provider<S: Scraper> {
    pub(crate) name: &'static str,

    /// TODO: Used for configuration in the future. Temporarily invalid.
    _is_enabled: bool,

    /// Common path prefix used in [`web::scope`](actix_web::web::scope).
    pub(crate) route: &'static str,

    /// A reusable client for sending request.
    request_client: Client,

    /// The `Scraper` of a `Provider`.
    scraper: S,
}

impl<S: Scraper> Provider<S> {
    /// Construct a new `Provider` from an instance of `Scraper`.
    pub(crate) fn new(
        name: &'static str,
        route: &'static str,
        scraper: S,
        proxy: Option<String>,
    ) -> Result<Self, reqwest::Error> {
        let mut client_builder = Client::builder().user_agent(USER_AGENT);
        if let Some(s) = proxy {
            trace!("create Provider '{}' with proxy: {}", name, s);
            client_builder = client_builder.proxy(Proxy::all(s)?);
        }
        Ok(Self {
            name,
            _is_enabled: true,
            route,
            request_client: client_builder.build()?,
            scraper,
        })
    }

    /// Request handler for the route "`/type`".
    pub(crate) async fn generate_type(&self) -> Json<Types> {
        let mut result = Types { types: Vec::new() };
        if let Ok(html) = request_html(&self.request_client, S::TYPE_URL).await {
            if let Some(types) = self.scraper.extract_types(html) {
                result.types = types;
            }
        }
        Json(result)
    }

    /// Request handler for the route "`/subgroup`".
    pub(crate) async fn generate_subgroup(&self) -> Json<Subgroups> {
        let mut result = Subgroups {
            subgroups: Vec::new(),
        };
        if let Ok(html) = request_html(&self.request_client, S::SUBGROUP_URL).await {
            if let Some(subgroups) = self.scraper.extract_subgroups(html) {
                result.subgroups = subgroups;
            }
        }
        Json(result)
    }

    /// Request handler for the route "`/list`".
    #[cfg(not(feature = "search-option"))]
    pub(crate) async fn generate_list(&self, query: Query<ListQuery>) -> Json<List> {
        let mut result = List {
            has_more: false,
            resources: Vec::new(),
        };
        let url = S::list_url(&query.into_inner());
        if let Ok(html) = request_html(&self.request_client, &url).await {
            if let Some(list) = self.scraper.extract_list(html) {
                result = list;
            }
        };
        debug!("{} resources returned", result.resources.len());
        Json(result)
    }

    /// Request handler for the route "`/list`".
    #[cfg(feature = "search-option")]
    pub(crate) async fn generate_list(&self, query: Query<ListQuery>) -> Json<List> {
        let mut result = List {
            has_more: false,
            resources: Vec::new(),
        };

        let mut query = query.into_inner();
        log::debug!("received {:?}", query);
        let search_options = SearchOptions::new(&query.keyword);
        // separate search-options from keyword
        query.keyword = search_options.keyword.clone();
        // the page number in the search-options is more important than that from QueryString
        query.page = crate::model::Page(search_options.options.page);

        let urls = S::list_urls(&query, &search_options);
        let mut htmls = Vec::new();
        for url in urls {
            if let Ok(html) = request_html(&self.request_client, &url).await {
                htmls.push(html);
            } else {
                log::warn!("some requests failed, we can't continue");
                return Json(result);
            }
        }

        if let Some(list) = self.scraper.extract_list(htmls, query, search_options) {
            result = list;
        }

        debug!(
            "a total of {} resources were returned",
            result.resources.len()
        );
        Json(result)
    }
}
