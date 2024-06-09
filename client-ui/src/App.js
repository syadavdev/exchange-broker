import React, { useState, useEffect } from 'react';

function HttpCallPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  var [formData, setFormData] = useState({
    "brokerName" : "ZERODHA",
    "brokerUserId" : 1
  });

  const handleChange = (event) => {
    const { name, type, value } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value,
    });
  };

  const handleOnclick = (event) => {
    const { name, type, value } = event.target;
    setFormData({
      ...formData,
      ['orderType'] : value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8081/market', { // Replace with your endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData }), // Get action from button value
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <label htmlFor="ticker">Symbol:</label>
          <input
            type="text"
            name="ticker"
            value={formData.ticker}
            onChange={handleChange}
            id="ticker"
            placeholder="Enter Ticker"
            style={{ marginRight: '10px' }} // Add margin-right for horizontal gap
          />
        </div>
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            id="price"
            placeholder="Enter Price"
            style={{ marginRight: '10px' }} // Add margin-right for horizontal gap
          />
        </div>
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            id="quantity"
            placeholder="Enter Quantity"
          />
        </div>
        <button type="submit" value="BUY" disabled={loading} onClick={handleOnclick} style={{
            backgroundColor: '#04AA6D',
            padding: '10px 20px', // Increase button size with padding
            fontSize: '16px', // Increase button font size
            marginRight: '10px',
          }}>
          Buy
        </button>
        <button type="submit" value="SELL" disabled={loading} onClick={handleOnclick} style={{
            backgroundColor: '#f44336',
            padding: '10px 20px', // Increase button size with padding
            fontSize: '16px', // Increase button font size
            marginRight: '10px',
          }}>
          Sell
        </button>
      </form>
      <br />
      <br />
      {loading && <p>Loading data...</p>}
      {error && <p>Error: {error}</p>}
      {data && (
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      )}
    </div>
  );
}

export default HttpCallPage;