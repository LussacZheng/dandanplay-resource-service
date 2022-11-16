pub(crate) mod dmhy;

use actix_web::web::{Json, Query};
use reqwest::Client;

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
    /// Similar to [`TYPE_URL`](Scraper::TYPE_URL) and [`SUBGROUP_URL`](Scraper::SUBGROUP_URL),
    /// but in the form of computation.
    fn list_query_formatter(query: &ListQuery) -> String;

    /// Extract an array of [`Type Item`](crate::model::Types) from `html` string.
    fn extract_types(&self, html: String) -> Option<Vec<Item>>;

    /// Extract an array of [`Subgroup Item`](crate::model::Subgroups) from `html` string.
    fn extract_subgroups(&self, html: String) -> Option<Vec<Item>>;

    /// Extract a [`List`](crate::model::List) from `html` string.
    fn extract_list(&self, html: String) -> Option<List>;
}

/// A `Provider` defines the route scope and its scraper.
///
/// `Provider` with any type that implements [`Scraper`] can be registered in the main App.
///
/// - **To add a new [`Provider`], you just need to add a new type which implements [`Scraper`].**
pub(crate) struct Provider<S: Scraper> {
    /// TODO: Temporarily useless.
    _name: &'static str,

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
    pub(crate) fn new(name: &'static str, route: &'static str, scraper: S) -> Self {
        Self {
            _name: name,
            _is_enabled: true,
            route,
            request_client: Client::builder()
                .user_agent(USER_AGENT)
                .build()
                .expect("Failed to build a Client for further request"),
            scraper,
        }
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
    pub(crate) async fn generate_list(&self, query: Query<ListQuery>) -> Json<List> {
        let mut result = List {
            has_more: false,
            resources: Vec::new(),
        };
        let url = S::list_query_formatter(&query.into_inner());
        if let Ok(html) = request_html(&self.request_client, &url).await {
            if let Some(list) = self.scraper.extract_list(html) {
                result = list
            }
        };
        Json(result)
    }
}
