import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function PriceChart({ priceData, id }) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (priceData.length > 0 && chartRef.current) {
            const prices = priceData.map((data) => data.price);
            const timestamps = priceData.map((data) => new Date(data.timestamp * 1000));

            // Calculate the timestamp for one minute ago
            const oneMinuteAgo = new Date(Date.now() - 60000);

            // Filter the data to include only the last minute's worth of data
            const filteredPrices = [];
            const filteredTimestamps = [];
            for (let i = 0; i < timestamps.length; i++) {
                if (timestamps[i] > oneMinuteAgo) {
                    filteredPrices.push(prices[i]);
                    filteredTimestamps.push(timestamps[i]);
                }
            }

            if (chartInstance.current) {
                // Update existing chart data instead of destroying it
                chartInstance.current.data.labels = filteredTimestamps;
                chartInstance.current.data.datasets[0].data = filteredPrices;
                chartInstance.current.update();
            } else {
                const ctx = chartRef.current.getContext('2d');
                chartInstance.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: filteredTimestamps,
                        datasets: [{
                            label: 'Price',
                            data: filteredPrices,
                            borderColor: 'blue',
                            borderWidth: 1,
                            fill: false,
                        }],
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Price',
                                },
                            },
                            x: {
                                type: 'time',
                                time: {
                                    tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                                    displayFormats: {
                                        millisecond: 'yyyy-MM-dd HH:mm:ss.SSS',
                                        second: 'HH:mm:ss', // Only display hours, minutes, and seconds
                                        minute: 'HH:mm:ss', // Only display hours, minutes, and seconds
                                        hour: 'HH:mm', // Only display hours and minutes
                                        day: 'yyyy-MM-dd',
                                        week: 'yyyy-MM-dd',
                                        month: 'yyyy-MM',
                                        quarter: 'yyyy-QQ',
                                        year: 'yyyy',
                                    },
                                    auto: true, // Automatically determine time scale
                                },
                                title: {
                                    display: true,
                                    text: 'Time',
                                },
                            },
                        },
                    },
                });
            }
        }
    }, [priceData, id]); // Include id in the dependency array

    return <canvas id={`priceChart-${id}`} ref={chartRef} width="400" height="200"></canvas>;
}

export default PriceChart;
