mod tcp_server;
mod coordinator;

#[tokio::main]
async fn main() {
    // tcp_server::run_server().await;
    coordinator::run_coordinator().await;
}
