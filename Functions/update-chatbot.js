const { processMessage } = require('./hugging-face-api');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const message = body.message;
    if (!message) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing message field' }) };
    }

    try {
        const aiResponse = await processMessage(message);
        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse }),
        };
    } catch (error) {
        console.error('Error processing message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error processing message' }),
        };
    }
};
