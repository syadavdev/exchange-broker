import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs'; // Import Stomp.js Client
import PriceChart from './PriceChart'; // Import the PriceChart component

const SOCKET_URL = 'ws://localhost:8081/ws'; // Replace with your actual URL
const REFRESH_INTERVAL = 2000; // Interval in milliseconds

function TickerPrice() {
    const [price, setPrice] = useState(null);
    const [tickerName, setTickerName] = useState('');
    const [priceData, setPriceData] = useState([]); // State to hold price data for chart
    const [chartInstance, setChartInstance] = useState(null); // State to hold chart instance
    const stompClient = useRef(null);
    const intervalIdRef = useRef(null);

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
            // Generate new timestamp for each sendName call
            const newTimestamp = Date.now();
            setPriceData(prevData => [...prevData, { price, timestamp: newTimestamp }]);
        } else {
            console.warn('Cannot send request: Not connected to WebSocket');
        }
    };

    const handleRequestPrice = () => {
        if (chartInstance) {
            chartInstance.destroy(); // Destroy existing chart instance
        }
        setPriceData([]); // Clear previous price data for the new request
        setPrice(null);
        connect(); // Connect to WebSocket
        sendName();
    };

    useEffect(() => {
        // Update priceData when price changes
        if (price !== null) {
            // Check if the price is not already present in priceData
            if (!priceData.some(data => data.price === price)) {
                setPriceData(prevData => [...prevData, { price, timestamp: Date.now() }]);
            }
        }
    }, [price, priceData]); // Include priceData as a dependency
    

    return (
        <div id="main-content" className="container">
            <div className="row">
                <div className="col-md-12">
                    <form
                        className="form-inline"
                        onSubmit={(e) => {
                            e.preventDefault();
                            connect();
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
                        <button id="send" className="btn btn-default" type="submit" onClick={handleRequestPrice}>
                            Request Price
                        </button>
                    </form>
                </div>
            </div>
            <br />
            <div className="row">
                {price ? (
                    <PriceChart priceData={priceData} setChartInstance={setChartInstance} /> // Pass setChartInstance function as prop
                ) : (
                    <p id="greetings">Fetching price...</p>
                )}
            </div>
        </div>
    );
}

export default TickerPrice;
