use std::{
    future::Future,
    pin::Pin,
    task::{Context, Poll},
    time::Duration
};
use tokio::time::Sleep;

struct MyFuture {
    sleep: Pin<Box<Sleep>>,
}

impl MyFuture {
    fn new() -> Self {
        Self {
            sleep: Box::pin(tokio::time::sleep(Duration::from_secs(1))),
        }
    }
}

impl Future for MyFuture {
    type Output = ();

    fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        println!("MyFuture::poll() \n");

        self.sleep.as_mut().poll(cx)
    }
}

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let fut = MyFuture::new();

    println!("Awaiting fut...");
    fut.await;
    println!("Awaiting fut... done");
}
