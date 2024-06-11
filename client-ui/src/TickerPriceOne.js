import React, { useState, useRef, useEffect } from 'react';
import { Client } from '@stomp/stompjs'; // Import Stomp.js Client
import { Line } from 'react-chartjs-2'; // Import Line chart from Chart.js

const SOCKET_URL = 'ws://localhost:8081/ws'; // Replace with your actual URL
const REFRESH_INTERVAL = 3000; // Interval in milliseconds

function TickerPrice() {
    const [price, setPrice] = useState(null);
    const [tickerName, setTickerName] = useState('');
    const [chartData, setChartData] = useState({}); // State for chart data
    const [chartVisible, setChartVisible] = useState(false); // State to track chart visibility
    const stompClient = useRef(null);
    const intervalIdRef = useRef(null); // Use ref for interval ID
    const chartKey = useRef(0); // Key to force re-render of chart component

    const handleInputChange = (event) => {
        setTickerName(event.target.value);
    };

    const connect = () => {
        if (!stompClient.current || !stompClient.current.connected) {
            stompClient.current = new Client({ brokerURL: SOCKET_URL }); // Initialize Stomp.js Client
            stompClient.current.onConnect = (frame) => {
                console.log('Connected: ' + frame);
                stompClient.current.subscribe('/price', (data) => {
                    const newPrice = JSON.parse(data.body).price;
                    setPrice(newPrice);
                    updateChartData(newPrice); // Update chart data
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

    const updateChartData = (newPrice) => {
        setChartData((prevData) => ({
            labels: [...(prevData.labels || []), new Date()], // Use Date object for time
            datasets: [
                {
                    ...prevData.datasets[0],
                    data: [...(prevData.datasets[0]?.data || []), newPrice], // Add new price to data array
                },
            ],
        }));
    };

    useEffect(() => {
        // Initialize chart data
        setChartData({
            labels: [],
            datasets: [
                {
                    label: 'Price Over Time',
                    data: [],
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        });
    }, []);

    const handleRequestPrice = (e) => {
        e.preventDefault(); // Prevent form submission
        connect(); // Call connect function on form submission
        setChartVisible(true); // Show the chart
        chartKey.current += 1; // Increment chart key to force re-render
    };

    return (
        <div id="main-content" className="container">
            <div className="row">
                <div className="col-md-12">
                    <form className="form-inline" onSubmit={handleRequestPrice}>
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
            {chartVisible && ( // Render the chart only if chartVisible is true
                <div className="row">
                    <div className="col-md-12">
                        <Line key={chartKey.current} data={chartData} />
                    </div>
                </div>
            )}
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
