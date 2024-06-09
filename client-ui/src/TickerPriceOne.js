import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-luxon'; // Import luxon adapter for Chart.js
import { DateTime } from 'luxon';

Chart.register(...registerables); // Register necessary components

const SOCKET_URL = 'ws://localhost:8081/ws'; // Replace with your actual URL
const REFRESH_INTERVAL = 1000; // Interval in milliseconds

function TickerPriceOne() {
    const [connected, setConnected] = useState(false);
    const [price, setPrice] = useState(null);
    const [tickerName, setTickerName] = useState('');
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Price',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    });
    const wsClientRef = useRef(null);
    const intervalIdRef = useRef(null); // Use ref for interval ID
    const chartRef = useRef(null); // Reference to the chart instance

    const handleInputChange = (event) => {
        setTickerName(event.target.value);
    };

    const connect = async () => {
        const stompClient = new StompJs.Client({ brokerURL: SOCKET_URL });
        wsClientRef.current = stompClient;
        stompClient.onConnect = (frame) => {
            setConnected(true);
            console.log('Connected: ' + frame);
            stompClient.subscribe('/price', (data) => {
                const newPrice = JSON.parse(data.body).price;
                const timestamp = DateTime.local(); // Get current timestamp using Luxon
                setPrice(newPrice);
                updateChartData(timestamp, newPrice);
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
    };

    const sendName = async () => {
            // Stop existing interval before sending for new ticker
            clearInterval(intervalIdRef.current);

            // Destroy existing chart before creating a new one (if applicable)
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            wsClientRef.current.publish({
                destination: "/app/tickerPrice",
                body: JSON.stringify({ tickerName }),
            });
            // Start new interval with the new ticker name
            intervalIdRef.current = setInterval(() => sendName(), REFRESH_INTERVAL);
        
    };

    const updateChartData = (timestamp, newPrice) => {
        const newChartData = { ...chartData }; // Copy existing data
        newChartData.labels.push(timestamp.toMillis()); // Convert Luxon DateTime to milliseconds
        newChartData.datasets[0].data.push(newPrice); // Add price to data

        // Limit data points to a certain number (optional)
        if (newChartData.labels.length > 20) { // Adjust limit as needed
            newChartData.labels.shift(); // Remove the oldest data point
            newChartData.datasets[0].data.shift();
        }

        setChartData(newChartData); // Update chart data state
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
                <div className="col-md-12"> {/* Combine both sections */}
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
                <Line
                    ref={chartRef}
                    data={chartData}
                    options={{
                        scales: {
                            x: {
                                type: 'timeseries', // Set x-axis scale type to 'timeseries' for timestamp labels
                                time: {
                                    unit: 'millisecond' // Optionally set time unit
                                }
                            },
                            // Add options for y-axis if needed
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default TickerPriceOne;
