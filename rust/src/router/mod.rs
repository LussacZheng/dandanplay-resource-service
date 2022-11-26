use actix_web::http::header::ContentType;
use actix_web::web::{self, Data, Query, ServiceConfig};
use actix_web::{get, HttpResponse, Responder};
use log::trace;

use crate::api::{Provider, Scraper};
use crate::model::{ListQuery, MetaInfo};

/// Returns an index page for the root route.
#[get("/")]
pub(crate) async fn index() -> impl Responder {
    HttpResponse::Ok()
        .content_type(ContentType::html())
        .body(include_str!("./index.html"))
}

/// Returns the meta info about this API self.
#[get("/self")]
pub(crate) async fn meta() -> impl Responder {
    web::Json(MetaInfo::default())
}

/// Register adds a new router scope according to the fields of [`Provider`].
///
/// You need to pass the returned `FnOnce` into
/// [`App::configure`](actix_web::App::configure) for this to take effect.
pub(crate) fn register<S: Scraper + 'static>(p: Provider<S>) -> impl FnOnce(&mut ServiceConfig) {
    // We'd better not to use "/" here,
    // otherwise the path will be "//foo" instead of "/foo".
    let route = if p.route == "/" { "" } else { p.route };

    trace!("register a Provider '{}' at '{}'", p.name, p.route);

    |cfg: &mut ServiceConfig| {
        cfg.service(
            // web::scope(p.route).route("/list", web::get().to(|| async { p.generate_type().await })),
            web::scope(route)
                .app_data(Data::new(p))
                .route(
                    "/type",
                    web::get()
                        .to(|data: Data<Provider<S>>| async move { data.generate_type().await }),
                )
                .route(
                    "/subgroup",
                    web::get().to(|data: Data<Provider<S>>| async move {
                        data.generate_subgroup().await
                    }),
                )
                .route(
                    "/list",
                    web::get().to(
                        |data: Data<Provider<S>>, query: Query<ListQuery>| async move {
                            data.generate_list(query).await
                        },
                    ),
                ),
        );
    }
}
