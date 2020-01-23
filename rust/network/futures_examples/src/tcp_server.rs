use futures::{
    channel::mpsc,
    future,
    stream::{self, select, StreamExt},
};
use std::time::Duration;
use tokio::{io::AsyncReadExt, net::TcpListener, time::interval};

async fn bg_task(rx: mpsc::Receiver<usize>) {
    // The stream of received `usize` values will be merged with a 30
    // second interval stream. The value types of each stream must
    // match. This enum is used to track the various values.
    #[derive(Eq, PartialEq)]
    enum Item {
        Value(usize),
        Tick,
        Done,
    }

    // Interval at which the current sum is written to STDOUT.
    let tick_dur = Duration::from_secs(5);

    let interval = interval(tick_dur).map(|_| Item::Tick);

    // Turn the stream into a sequence of:
    // Item(num), Item(num), ... Done
    let items = select(
        rx.map(Item::Value)
            .chain(stream::once(async { Item::Done })),
        // merge Done into the stream of intervals
        interval,
    )
    .take_while(|item| future::ready(*item != Item::Done));

    items
        .fold(0, |num, item| {
            let ret = match item {
                Item::Value(v) => num + v,
                Item::Tick => {
                    println!("bytes read = {}", num);
                    0
                }
                _ => unreachable!(),
            };

            async move { ret }
        })
        .await;
}

pub async fn run_server() {
		let mut listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();

    println!("start listen on {:?}", "127.0.0.1:8080");

    let (mut tx, rx) = mpsc::channel::<usize>(1_024);

    tokio::spawn(bg_task(rx));

    while let Some(stream) = listener.incoming().next().await {
        match stream {
            Ok(mut socket) => {
                println!("new client!");
                let mut buffer = Vec::new();
                println!("start read msg");
                socket.read_to_end(&mut buffer).await.unwrap();
                println!("read msg over");
                if let Err(e) = tx.try_send(buffer.len()) {
                    println!("send to rx error={:?}", e);
                };
            }
            Err(e) => { 
                println!("connection socket failed {:?}", e);
            }
        }
    }
}