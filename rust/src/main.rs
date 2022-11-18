mod api;
mod model;
mod router;
mod util;

use actix_web::{middleware::Logger, web, App, HttpResponse, HttpServer};
use clap::Parser;

use crate::api::{Dmhy, Provider};
use crate::router::{index, meta, register};

#[derive(Debug, Parser)]
#[command(about, long_about = None)]
struct Cli {
    /// IP address the API listens on,
    /// such as "0.0.0.0", "127.0.0.1", or "192.168.0.100"
    #[arg(short = 'H', long, default_value = "localhost")]
    host: String,

    /// Listen port of the API
    #[arg(short = 'P', long, default_value_t = 8080)]
    port: u16,

    /// Proxy address for web scraper, "http" and "socks5" are supported
    ///
    /// Besides this option, all of the following settings are valid:
    /// "System Proxies", `HTTP_PROXY`, or `HTTPS_PROXY`.
    #[arg(short = 'x', long)]
    proxy: Option<String>,

    /// Use verbose output (`-vv` for very verbose output)
    #[arg(short, long, action = clap::ArgAction::Count)]
    verbose: u8,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let cli: Cli = Cli::parse();

    #[cfg(feature = "log")]
    log::pre_log(&cli);

    // start the HTTP server
    HttpServer::new(move || {
        let dmhy = Provider::new(
            "dmhy",
            "/",
            Dmhy::new().expect("Failed to build a Scraper for further request"),
            cli.proxy.clone(),
        )
        .expect("Failed to build a Provider for further request");
        let config = register(dmhy);

        App::new()
            .wrap(Logger::default())
            .service(index)
            .service(meta)
            .default_service(web::to(|| async {
                HttpResponse::NotFound().body("Not Found.")
            }))
            .configure(config)
    })
    .bind((cli.host, cli.port))?
    .run()
    .await
}

#[cfg(feature = "log")]
mod log {
    use env_logger::{Builder, Env};
    use log::{debug, info};

    use super::Cli;

    /// Print some debug information before starting the HTTP server.
    pub(super) fn pre_log(cli: &Cli) {
        init_logger(cli.verbose);

        // print cli arguments
        debug!("{:?}", cli);

        // print listening address
        info!(
            "Listening and serving HTTP on http://{}:{}",
            if cli.host.is_empty() {
                // only when running: CLI -H '""'
                "0.0.0.0"
            } else {
                &cli.host
            },
            cli.port
        );
    }

    /// Start the [`env_logger`].
    fn init_logger(verbose: u8) {
        // To override this `filter`, set the environment variable `RUST_LOG`
        // with your customize value.
        let filter = logger_filter(verbose);
        Builder::new()
            .format_target(false)
            // .format_timestamp(None)
            .parse_env(Env::default().default_filter_or(filter))
            .init();
    }

    /// Specify the default logger filter based on the value of `verbose`.
    fn logger_filter(verbose: u8) -> String {
        // This is equivalent to `export RUST_LOG=info,dandanplay_resource_service`.
        let mut logger_filter = format!("info,{}", env!("CARGO_PKG_NAME").replace('-', "_"));

        // no `-v` -> `info,self=info`  (only INFO logs for all crate)
        // `-v`    -> `info,self=debug` (enable DEBUG logs for this crate)
        // `-vv`   -> `info,self=trace` (enable all logs for this crate self)
        // `-vvv`  -> `info,self=trace,reqwest=debug,actix=debug`
        //                              (additional logs from reqwest and actix)
        // `-vvvv` -> `info,self=trace,all_others=debug`
        //                              (except for some crates with huge DEBUG logs)
        // `-v` * 4~9 is equivalent to `-vvvv`
        // `-v` * 10+ will be ignored
        match verbose {
            1 => logger_filter += "=debug",
            2 => {}
            3 => logger_filter += ",reqwest=debug,actix=debug",
            4..=9 => logger_filter += ",debug,html5ever=info,selectors=info,hyper=info",
            _ => logger_filter += "=info",
        }

        logger_filter
    }
}
