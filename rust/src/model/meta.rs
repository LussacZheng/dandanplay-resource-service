use once_cell::sync::Lazy;
use regex::Regex;
use serde::Serialize;

/// A reusable regular expression for testing SEMVER.
static RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"^[\d.]+$").expect("failed to compile a regex"));

/// Return struct of route "`/self`".
#[derive(Serialize)]
pub(crate) struct MetaInfo {
    name: &'static str,
    version: &'static str,
    /// development version or stable release
    dev: bool,
    info: Info,
    meta: Meta,
    options: Options,
}

#[derive(Serialize)]
struct Info {
    homepage: &'static str,
    description: &'static str,
}

#[derive(Serialize)]
struct Meta {
    implementation: Implementation,
    git_commit_hash: &'static str,
    build_at: &'static str,
}

#[derive(Serialize)]
struct Implementation {
    platform: &'static str,
    tool: &'static str,
    version: &'static str,
}

#[derive(Serialize)]
struct Options {
    instruction: &'static str,
    supported: Vec<&'static str>,
}

impl Default for MetaInfo {
    fn default() -> Self {
        Self {
            // https://doc.rust-lang.org/cargo/reference/environment-variables.html
            name: env!("CARGO_PKG_NAME"),
            version: env!("CARGO_PKG_VERSION"),
            dev: !RE.is_match(env!("CARGO_PKG_VERSION")),
            info: Info {
                homepage: env!("CARGO_PKG_HOMEPAGE"),
                description: env!("CARGO_PKG_DESCRIPTION"),
            },
            meta: Meta {
                implementation: Implementation {
                    platform: env!("TARGET"),
                    tool: "rust",
                    version: env!("RUSTC_VERSION"),
                },
                git_commit_hash: env!("GIT_COMMIT_HASH"),
                build_at: env!("BUILD_AT"),
            },
            options: Options {
                instruction: concat!(env!("CARGO_PKG_REPOSITORY"), "/tree/main/docs"),
                supported: vec!["TODO:$realtime", "TODO:$page", "TODO:$limit"],
            },
        }
    }
}
