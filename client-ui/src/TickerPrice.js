import React, { useState, useRef } from 'react';
import { Client } from '@stomp/stompjs'; // Import Stomp.js Client

const SOCKET_URL = 'ws://localhost:8081/ws'; // Replace with your actual URL
const REFRESH_INTERVAL = 3000; // Interval in milliseconds

function TickerPrice() {
    const [price, setPrice] = useState(null);
    const [tickerName, setTickerName] = useState('');
    const stompClient = useRef(null);
    const intervalIdRef = useRef(null); // Use ref for interval ID

    const handleInputChange = (event) => {
        setTickerName(event.target.value);
    };

    const connect = () => {
        if (!stompClient.current || !stompClient.current.connected) {
            stompClient.current = new StompJs.Client({ brokerURL: SOCKET_URL }); // Initialize Stomp.js Client
            stompClient.current.onConnect = (frame) => {
                console.log('Connected: ' + frame);
                stompClient.current.subscribe('/price', (data) => {
                    const newPrice = JSON.parse(data.body).price;
                    setPrice(newPrice);
                });
                // Start price request interval after connection
                intervalIdRef.current = setInterval(sendName, REFRESH_INTERVAL);
            };
            stompClient.current.onWebSocketError = (error) => {
                console.error('Error with websocket', error);
            };
            stompClient.current.onStompError = (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            };
            stompClient.current.activate(); // Use activate to initiate connection
        }
        sendName(); // Immediately request price after connecting or re-connecting
    };

    const sendName = () => {
        if (stompClient.current && stompClient.current.connected) {
            // Stop existing interval before sending for new ticker
            clearInterval(intervalIdRef.current);

            stompClient.current.publish({
                destination: '/app/tickerPrice',
                body: JSON.stringify({ tickerName }),
            });
            // Start new interval with the new ticker name
            intervalIdRef.current = setInterval(sendName, REFRESH_INTERVAL);
        } else {
            console.warn('Cannot send request: Not connected to WebSocket');
        }
    };

    return (
        <div id="main-content" className="container">
            <div className="row">
                <div className="col-md-12">
                    <form
                        className="form-inline"
                        onSubmit={(e) => {
                            e.preventDefault(); // Prevent form submission
                            connect(); // Call connect function on form submission
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor="tickerName">Ticker Name</label>
                            <input
                                type="text"
                                id="tickerName"
                                className="form-control"
                                placeholder="Ticker Name"
                                value={tickerName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button id="send" className="btn btn-default" type="submit">
                            Request Price
                        </button>
                    </form>
                </div>
            </div>
            <br />
            <div className="row">
                {price ? (
                    <p id="greetings">Current Price: {price}</p>
                ) : (
                    <p id="greetings">Fetching price...</p>
                )}
            </div>
        </div>
    );
}

export default TickerPrice;
