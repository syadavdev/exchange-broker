import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs'; // Import Stomp.js Client

const SOCKET_URL = 'ws://localhost:8081/ws'; // Replace with your actual URL
const REFRESH_INTERVAL = 3000; // Interval in milliseconds

function TickerPrice() {
    const [connected, setConnected] = useState(false);
    const [price, setPrice] = useState(null);
    const [tickerName, setTickerName] = useState('');
    const wsClientRef = useRef(null);
    const intervalIdRef = useRef(null); // Use ref for interval ID

    const handleInputChange = (event) => {
        setTickerName(event.target.value);
    };

    const connect = async () => {
        if(!connected){
            const stompClient = new StompJs.Client({ brokerURL: SOCKET_URL }); // Initialize Stomp.js Client
            wsClientRef.current = stompClient;
            stompClient.onConnect = (frame) => {
                setConnected(true);
                console.log('Connected: ' + frame);
                stompClient.subscribe('/price', (data) => {
                    const newPrice = JSON.parse(data.body).price;
                    setPrice(newPrice);
                });
                // Start price request interval after connection
                intervalIdRef.current = setInterval(() => sendName(), REFRESH_INTERVAL);
            };
            stompClient.onWebSocketError = (error) => {
                console.error('Error with websocket', error);
            };
            stompClient.onStompError = (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            };
            stompClient.activate(); // Use activate to initiate connection
        }else{
            wsClientRef.current.deactivate();
            wsClientRef.current.subscribe('/price', (data) => {
                const newPrice = JSON.parse(data.body).price;
                setPrice(newPrice);
            })
            wsClientRef.current.activate();
        }
    };

    const sendName = async () => {
        if (connected) {
            // Stop existing interval before sending for new ticker
            clearInterval(intervalIdRef.current);

            wsClientRef.current.publish({
                destination: "/app/tickerPrice",
                body: JSON.stringify({ tickerName }),
            });
            // Start new interval with the new ticker name
            intervalIdRef.current = setInterval(() => sendName(), REFRESH_INTERVAL);
        } else {
            console.warn("Cannot send request: Not connected to WebSocket");
        }
    };

    useEffect(() => {
        return () => {
            // Clear price request interval on unmount
            clearInterval(intervalIdRef.current);
            if (wsClientRef.current) {
                wsClientRef.current.deactivate();
            }
        };
    }, []);

    return (
        <div id="main-content" className="container">
            <div className="row">
                <div className="col-md-12">
                    <form className="form-inline">
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
                        <button id="send" className="btn btn-default" type="button" onClick={connect}>
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
