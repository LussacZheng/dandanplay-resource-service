use log::debug;
use reqwest::Client;

/// A default user-agent for request Header.
pub const USER_AGENT: &str =
    "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0";

/// Send a `GET` request and receive the response body as a `String`.
pub async fn request_html(client: &Client, url: &str) -> Result<String, reqwest::Error> {
    debug!("send request to: {}", url);
    client.get(url).send().await?.text().await
}
