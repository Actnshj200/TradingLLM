const axios = require('axios');
const { ProcessBinanceData } = require('./Binance');
const conversationHistory = new Map();

const getCookieValue = (cookieString, cookieName) => {
    const cookies = cookieString.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        const [name, value] = cookies[i].split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    return null;
};

exports.handler = async function (event, context) {
    console.log("Entering Message in LLM");
    console.log(event.body);
    if (event.body.includes("Binance")) {
        try {
            const systemPrompt = "Determine a correct Long/Short prediction based on the data that shows the currrent trend, only reply with the following: BUY/SELL, Symbol (Example it has to be formatted as currency-USD so BTC-USD for example, Closing price (add a certain amount to give it cushion for the order to trigger), Create a Good Stop Price, Create a Good Limit Price";
            console.log("Entering Message: " + event.body);
            const messages = [
                {
                    "role": "system",
                    "content": systemPrompt,
                },
                {
                    "role": "user",
                    "content": event.body,
                }
            ];

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4",
                messages: messages,
                temperature: 0.1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("OpenAI response:", response.data.choices[0].message.content);

            let responseBinance;
            try {
                const binanceRequestData = { resp: response.data.choices[0].message.content };
                console.log("Data being sent to Binance:", JSON.stringify(binanceRequestData));
                responseBinance = await axios.post(`${process.env.SITE_URL}/.netlify/functions/Binance`,
                    { resp: response.data.choices[0].message.content },
                    { headers: { 'Content-Type': 'application/json' } });

                console.log("Binance response:", responseBinance.data);
            } catch (error) {
                console.error('Error in Binance request:', error.message);
                throw error; // Re-throw to be caught by outer try-catch
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ response: responseBinance.data }),
            };
        } catch (error) {
            console.error('Error in handler:', error);
            if (error.response) {
                console.error('Coinbase error details:', error.response.data);
            }
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'An error occurred', details: error.message }),
            };
        }
    }

    else {
        try {
            const systemPrompt = "Based on the Data only reply with the following: BUY/SELL, Symbol (Example it has to be formatted as currency-USD so BTC-USD for example, Closing price (add a certain amount to give it cushion for the order to trigger), Create a Good Stop Price, Create a Good Limit Price";
            console.log("Entering Message: " + event.body);
            const messages = [
                {
                    "role": "system",
                    "content": systemPrompt,
                },
                {
                    "role": "user",
                    "content": event.body,
                }
            ];

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4",
                messages: messages,
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("OpenAI response:", response.data.choices[0].message.content);

            let responseCoinbase;
            try {
                const coinbaseRequestData = { resp: response.data.choices[0].message.content };
                console.log("Data being sent to Coinbase:", JSON.stringify(coinbaseRequestData));
                responseCoinbase = await axios.post(`${process.env.SITE_URL}/.netlify/functions/Coinbase`,
                    { resp: response.data.choices[0].message.content },
                    { headers: { 'Content-Type': 'application/json' } });

                console.log("Coinbase response:", responseCoinbase.data);
            } catch (error) {
                console.error('Error in Coinbase request:', error.message);
                throw error; // Re-throw to be caught by outer try-catch
            }

            return {
                statusCode: 200,
                body: JSON.stringify({ response: responseCoinbase.data }),
            };
        } catch (error) {
            console.error('Error in handler:', error);
            if (error.response) {
                console.error('Coinbase error details:', error.response.data);
            }
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'An error occurred', details: error.message }),
            };
        }
    }

};
async function processMessage(message) {
    console.log("Entering Message in LLM");
    console.log(message);
        try {
            const systemPrompt = "Based on the Data only reply with the following Format:LONG/SHORT, Symbol (Example it has to be formatted as currencyUSDT so BTCUSDT for example, Closing price (add a certain amount to give it cushion for the order to trigger), Give a Leverage number from 1-20 based on your confidence Level";
            console.log("Entering Message: " + message);
            const messages = [
                {
                    "role": "system",
                    "content": systemPrompt,
                },
                {
                    "role": "user",
                    "content": message,
                }
            ];

            const response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: "gpt-4",
                messages: messages,
                temperature: 1,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("OpenAI response:", response.data.choices[0].message.content);
            // Call the function directly instead of using axios
            const aiResponse = await ProcessBinanceData(response.data.choices[0].message.content);

            //res.status(200).json({
            //    originalMessage: message,
            //    aiResponse: aiResponse.response,
            //});
            
            
        } catch (error) {
            console.error('Error in handler:', error);
            if (error.response) {
                console.error('Binance error details:', error.response.data);
            }
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'An error occurred', details: error.message }),
            };
        }  

}

module.exports = { processMessage };
