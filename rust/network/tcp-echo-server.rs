use std::net::{TcpListener, TcpStream};
use std::io::{Error, Read, Write};
use std::thread;

fn main() {
	const SOCKET: &str = "0.0.0.0:8888";
	let listener = TcpListener::bind(SOCKET).expect("Could not bind");
	println!("Tcp server listen on {:?}", SOCKET);

	for stream in listener.incoming() {
		match stream {
			Err(e) => eprintln!("failed: {}", e),
			Ok(stream) => {
				thread::spawn(move || {
						handle_client(stream).unwrap_or_else(|error| eprintln!("{:?}", error));
				});
			}
		}
	}

}

fn handle_client(mut stream: TcpStream) -> Result<(), Error> {
	println!("Incoming connection from: {}", stream.peer_addr()?);

	let mut buf = [0; 512];

	loop {
		let bytes_read = stream.read(&mut buf)?;
		if bytes_read == 0 {
			return Ok(());
		}

		stream.write(&buf[..bytes_read])?;
	}
}