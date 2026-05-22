const axios = require('axios');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const tradingViewData = JSON.parse(event.body);

  // Process the TradingView data and extract the relevant information
  const message = `TradingView Alert: ${tradingViewData.alert_name}`;

  try {
    await axios.post(`${process.env.SITE_URL}/.netlify/functions/update-chatbot`, {
      message: message,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'TradingView alert processed successfully' }),
    };
  } catch (error) {
    console.error('Error updating chatbot:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error updating chatbot' }),
    };
  }
};