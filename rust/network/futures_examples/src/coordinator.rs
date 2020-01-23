use futures::{
    channel::{oneshot, mpsc},
    future::FutureExt,
		stream::StreamExt,
		sink::SinkExt
};
use std::time::{Duration, Instant};
use tokio::time::delay_for;


type Message = oneshot::Sender<Duration>;

#[derive(Clone)]
struct Transport;

impl Transport {
	fn send_ping(&self) {
		println!("send ping");
	}

	async fn recv_pong(&self) {
		delay_for(Duration::from_secs(1)).await;
		println!("receive pong");
	}
}

async fn coordinator_task(rx: mpsc::Receiver<Message>) {
	let transport = Transport;

	let fut = rx.for_each(move |pong_tx| {
		let start = Instant::now();
		
		transport.send_ping();

		let transport_clone = transport.clone();
		async move {
			let _ = transport_clone.recv_pong().await;

			if let Err(e) = pong_tx.send(start.elapsed()) {
				println!("send pong rx err={:?}", e);
			};
		}

	});

	println!("start run coordinator task...");
	fut.await;
}

async fn rtt(tx: &mut mpsc::Sender<Message>) -> Duration {
	let (resp_tx, resp_rx) = oneshot::channel();

	let _ = tx.send(resp_tx).await;
	let ret = resp_rx.map(|dur| dur.unwrap()).await;
	ret
}

pub async fn run_coordinator() {
	let (tx, rx) = mpsc::channel(1_024);

	tokio::spawn(coordinator_task(rx));

	for idx in 0..4 {
		let mut tx = tx.clone();

		tokio::spawn(async move {
			let dur = rtt(&mut tx).await;
			println!("ping {} duration is {:?}", idx + 1, dur);
		});
	}

	delay_for(Duration::from_secs(6)).await;

	println!("run coordinator over");
}