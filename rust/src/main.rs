mod api;
mod model;
mod router;
mod util;

use actix_web::{web, App, HttpResponse, HttpServer};

use crate::api::dmhy::Dmhy;
use crate::api::Provider;
use crate::router::{index, meta, register};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Listen at: http://127.0.0.1:8080");

    HttpServer::new(|| {
        // we'd better not to use "/" here, otherwise the path will be "//foo" instead of "/foo"
        let dmhy = Provider::new("dmhy", "", Dmhy::new());
        let config = register(dmhy);

        App::new()
            .service(index)
            .service(meta)
            .default_service(web::to(|| async {
                HttpResponse::NotFound().body("Not Found.")
            }))
            .configure(config)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
