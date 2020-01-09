use tokio::net::TcpListener;
use futures::stream::StreamExt;

#[tokio::main]
async fn main() {
    let addr = "127.0.0.1:6142";

    let mut listener = TcpListener::bind(addr).await.unwrap();

    let server = async move {
        let mut incoming = listener.incoming();

        while let Some(res) = incoming.next().await {
            match res {
                Ok(mut socket) => {
                    println!("Accepted connection from {:?}", socket.peer_addr());
                    tokio::spawn(async move {
                        let (mut reader, mut writer) = socket.split();
                        match tokio::io::copy(&mut reader, &mut writer).await {
                            Ok(amt) => println!("Wrote {} bytes", amt),
                            Err(e) => eprintln!("IO error={:?}", e)
                        }
                    });
                }
                Err(err) => {
                    eprintln!("accept error={:?}", err);
                }
            }
        }
    };

    println!("Echo server running on {:?}", addr);

    server.await;
}
