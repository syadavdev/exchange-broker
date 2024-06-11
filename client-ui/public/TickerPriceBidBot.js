// Define the range for the price value
const minPrice = 50;
const maxPrice = 2000;

// Function to generate a random price within the specified range
function generateRandomPrice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to make the POST request with alternating orderType
function makePostRequest() {
    const url = 'http://localhost:8081/market'; // Replace with your actual endpoint URL

    // Generate a random price within the specified range
    const price = generateRandomPrice(minPrice, maxPrice);

    // Request body for the first call with orderType as SELL
    const requestBody1 = {
        ticker: "APPLE",
        brokerName: "ZERODHA",
        brokerUserId: "1",
        orderType: "SELL",
        quantity: 1,
        price: price
    };

    // Request body for the second call with orderType as BUY
    const requestBody2 = {
        orderId: 14,
        ticker: "APPLE",
        brokerName: "ZERODHA",
        brokerUserId: "1",
        orderType: "BUY",
        quantity: 1,
        price: price
    };

    // Fetch options
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Make the first POST request with orderType as SELL
    fetch(url, { ...options, body: JSON.stringify(requestBody1) })
        .then(response => {
            if (response.ok) {
                console.log('First POST request successful with orderType as SELL');
                // Make the second POST request with orderType as BUY
                return fetch(url, { ...options, body: JSON.stringify(requestBody2) });
            } else {
                throw new Error('Failed to make first POST request with orderType as SELL');
            }
        })
        .then(response => {
            if (response.ok) {
                console.log('Second POST request successful with orderType as BUY');
            } else {
                throw new Error('Failed to make second POST request with orderType as BUY');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Call makePostRequest every 1 second
setInterval(makePostRequest, 1000); // 1000 milliseconds = 1 second
