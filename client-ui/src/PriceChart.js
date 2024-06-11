import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function PriceChart({ priceData }) {
  // Initialize arrays to store series data
  const seriesData = [];

  // Filter out price data points where price does not change for more than 5 minutes
  const filteredPriceData = [];
  let lastTimestamp = null;
  let lastPrice = null;

  for (const data of priceData) {
    if (lastTimestamp === null || lastPrice === null) {
      filteredPriceData.push(data);
    } else {
      const timeDifference = data.timestamp - lastTimestamp;
      if (timeDifference > 300 || data.price !== lastPrice) {
        filteredPriceData.push(data);
      }
    }

    lastTimestamp = data.timestamp;
    lastPrice = data.price;
  }

  // Convert filteredPriceData to series data format
  for (const data of filteredPriceData) {
    seriesData.push({
      x: data.timestamp * 1000, // Convert timestamp to milliseconds
      y: data.price
    });
  }

  // Options for Highcharts
  const options = {
    title: {
      text: 'Price Chart',
      style: {
        color: 'green' // Title text color
      }
    },
    chart: {
      backgroundColor: '#222' // Background color
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time',
        style: {
          color: 'blue' // X-axis label color
        }
      },
      labels: {
        style: {
          color: 'red' // X-axis tick label color
        }
      }
    },
    yAxis: {
      title: {
        text: 'Price',
        style: {
          color: 'blue' // Y-axis label color
        }
      },
      labels: {
        style: {
          color: 'red' // Y-axis tick label color
        }
      }
    },
    plotOptions: {
      series: {
        area: {
          color: 'rgba(0, 0, 255, 0.3)' // Transparent blue color for area below the line
        }
      }
    },
    series: [{
      name: 'Price',
      data: seriesData,
      lineWidth: 2, // Draw line instead of dots
      connectNulls: true // Connect the points even when there are missing data
    }],
    navigator: {
      enabled: true // Enable the navigator feature
    }
  };

  return (
    <div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
      />
    </div>
  );
}

export default PriceChart;
