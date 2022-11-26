use std::env::var;
use std::process::Command;

use chrono::{SecondsFormat, Utc};
use regex::Regex;
use rustc_version::version;

/// If there are too many environment variables to manage,
/// perhaps we should use the crate [`vergen`](https://docs.rs/vergen).
///
/// ```ignore
/// use vergen::{Config, vergen};
/// vergen(Config::default()).unwrap();
/// ```
fn main() {
    // "DEV"
    let dev = Regex::new(r"^[\d.]+$")
        .map(|re| !re.is_match(env!("CARGO_PKG_VERSION")))
        .unwrap_or(true);
    println!("cargo:rustc-env=DEV={}", dev);

    // "TARGET"
    // https://stackoverflow.com/a/51311222
    println!("cargo:rustc-env=TARGET={}", var("TARGET").unwrap());

    // "RUSTC_VERSION"
    let rustc_ver = version()
        .map(|v| v.to_string())
        .unwrap_or_else(|_| "unknown rustc version".to_string());
    println!("cargo:rustc-env=RUSTC_VERSION={}", rustc_ver);

    // "GIT_COMMIT_HASH"
    // https://stackoverflow.com/a/44407625
    println!("cargo:rustc-rerun-if-changed=.git/HEAD");
    let git_commit_hash = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .output()
        .ok()
        .and_then(|output| String::from_utf8(output.stdout).ok());
    println!(
        "cargo:rustc-env=GIT_COMMIT_HASH={}",
        git_commit_hash.unwrap_or_else(|| "unknown commit".to_string())
    );

    // "BUILD_AT"
    let build_at = Utc::now().to_rfc3339_opts(SecondsFormat::Secs, true);
    println!("cargo:rustc-env=BUILD_AT={}", build_at);
}
