
const { sign } = require('jsonwebtoken');
const crypto = require('crypto');

async function generateToken() {
    const key_name = process.env.COINBASE_KEY_NAME;
    const key_secret = process.env.COINBASE_KEY_SECRET;
    const request_method = 'POST';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/orders';

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign(
        {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        },
        key_secret,
        {
            algorithm,
            header: {
                kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
            },
        }
    );

    return token;
}

async function generateTokenGET() {
    const key_name = process.env.COINBASE_KEY_NAME;
    const key_secret = process.env.COINBASE_KEY_SECRET;
    const request_method = 'GET';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/portfolios';

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign(
        {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        },
        key_secret,
        {
            algorithm,
            header: {
                kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
            },
        }
    );

    return token;
}

async function generateTokenPortfolios() {
    const key_name = process.env.COINBASE_KEY_NAME;
    const key_secret = process.env.COINBASE_KEY_SECRET;
    const request_method = 'GET';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/portfolios/81709f6e-42a4-5d82-ab05-54ed3de8389c';

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign(
        {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        },
        key_secret,
        {
            algorithm,
            header: {
                kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
            },
        }
    );

    return token;
}

async function generateTokenAccount() {
    const key_name = process.env.COINBASE_KEY_NAME;
    const key_secret = process.env.COINBASE_KEY_SECRET;
    const request_method = 'GET';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/accounts';

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign(
        {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        },
        key_secret,
        {
            algorithm,
            header: {
                kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
            },
        }
    );

    return token;
}

async function generateTokenAccount1Inch(accountUUID) {
    const key_name = process.env.COINBASE_KEY_NAME;
    const key_secret = process.env.COINBASE_KEY_SECRET;
    const request_method = 'GET';
    const url = 'api.coinbase.com';
    const request_path = '/api/v3/brokerage/accounts/' + accountUUID;

    const algorithm = 'ES256';
    const uri = request_method + ' ' + url + request_path;

    const token = sign(
        {
            iss: 'cdp',
            nbf: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 120,
            sub: key_name,
            uri,
        },
        key_secret,
        {
            algorithm,
            header: {
                kid: key_name,
                nonce: crypto.randomBytes(16).toString('hex'),
            },
        }
    );

    return token;
}

const listAccounts = async (accessToken) => {
    let cursor = null;
    try {
        let listConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.coinbase.com/api/v3/brokerage/accounts',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                limit: 100,
                cursor: cursor
            }
        };

        let response = await axios.request(listConfig);
        console.log("List of Accounts:");
        response.data.accounts.forEach(account => {
            // console.log(`Account Name: ${account.name}, UUID: ${account.uuid}`);
        });

        return response.data.accounts;

    } catch (error) {
        console.error("Error listing accounts:", error);
    }
};

const getAccountDetails = async (accessToken, accountUUID) => {
    try {
        let accountConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.coinbase.com/api/v3/brokerage/accounts/${accountUUID}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };

        let response = await axios.request(accountConfig);
        console.log("Account Details:");
        // console.log(response);
        return response;
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("Error getting account details:", error);
    }
};

// Function to get the breakdown of a specific portfolio by UUID
async function getPortfolioBreakdown(accessToken, portfolioUuid) {
    try {
        const response = await axios.get(`https://api.coinbase.com/api/v3/brokerage/portfolios/${portfolioUuid}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}` // Add your authorization token here
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching portfolio breakdown:', error);
        throw error;
    }
}

async function listPortfolios(accessToken) {
    let cursor = null;
    try {
        let listConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.coinbase.com/api/v3/brokerage/portfolios',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        };
        console.log("List Config" + listConfig);
        let response = await axios.request(listConfig);
        console.log("List of Portfolios:");
        console.log(response.data);
        if (response.data != null) {
            console.log("entered protfolios check. Checking...")
            const firstPortfolioUuid = response.data[0].uuid;
            const token = await generateTokenPortfolios();
            console.log(token);
            const portfolioBreakdown = await getPortfolioBreakdown(token, '81709f6e-42a4-5d82-ab05-54ed3de8389c');
            console.log('First Portfolio Breakdown:', JSON.stringify(portfolioBreakdown, null, 2));
        } else {
            console.log('No portfolios found');
        }
    } catch (error) {
        console.error('Error in getting the first portfolio breakdown:', error);
    }

};


async function BuyOrder(token) {
    let data = JSON.stringify({
        "order_configuration": {
            "market_market_ioc": {
                "quote_size": "100",
            }
        },
        "side": "BUY",
        "product_id": "BTC-USD",
        "client_order_id": "985763342"
    });

    console.log(data);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.coinbase.com/api/v3/brokerage/orders',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };
    console.log(config);
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Error making the request:', error);
        throw error;
    }
}

async function SellOrder(token, amount, product_id) {
    const baseNumber = 735713340;
    const randomFactor = Math.random(); // generates a random number between 0 and 1
    const range = 1000000; // define a range for the random number
    const randomizedNumber = baseNumber + Math.floor((randomFactor - 0.5) * range * 2);
    const number = parseFloat(amount);
    const truncatedNumber = Math.trunc(number).toString();
    console.log(truncatedNumber);
    let data = JSON.stringify({
        "order_configuration": {
            "market_market_ioc": {
                "base_size": truncatedNumber,
            }
        },
        "side": "SELL",
        "product_id": product_id,
        "client_order_id": randomizedNumber.toString()
    });

    console.log(data);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.coinbase.com/api/v3/brokerage/orders',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };
    console.log(config);
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Error making the request:', error);
        throw error;
    }
}


async function LimitOrder(token) {
    let data = JSON.stringify({
        "order_configuration": {
            "limit_limit_gtc": {
                "base_size": "0.0015",
                "limit_price": "61000",
                "post_only": true
            }
        },
        "side": "BUY",
        "product_id": "BTC-USD",
        "client_order_id": "985763350"
    });

    console.log(data);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.coinbase.com/api/v3/brokerage/orders',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };
    console.log(config);
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Error making the request:', error);
        throw error;
    }
}

async function StopLossOrder(position,price, product_id, symbol, token, stop, limit) {
    console.log("Entering Stop Order");                      // price + (price * 0.01);
    const baseNumber = 735713340;
    const randomFactor = Math.random(); // generates a random number between 0 and 1
    const range = 1000000; // define a range for the random number
    let baseSize  = calculateBaseSize(price);
    console.log(`For price $${price}, base size: ${baseSize}`);

    const randomizedNumber = baseNumber + Math.floor((randomFactor - 0.5) * range * 2);

    let data = JSON.stringify({
        "client_order_id": randomizedNumber.toString(),
        "product_id": product_id,
        "side": position,
        "order_configuration": {
            "stop_limit_stop_limit_gtc": {
                "base_size": baseSize.toString(),
                "limit_price": limit,
                "stop_price": stop,
                "stop_direction": "STOP_DIRECTION_STOP_DOWN"
            }
        }
    })
    console.log("Data: " + data);

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.coinbase.com/api/v3/brokerage/orders',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        data: data
    };
    //console.log("Config" + config);
    try {
        const response = await axios(config);
        console.log("Finished WITH : " + response);
        return response.data;
    } catch (error) {
        console.error('Error making the request:', error);
        throw error;
    }
}


exports.handler = async function (event, context) {
    //console.log("entered");
    try {
        // To get the JSON string
        var jsonString = JSON.stringify(event.body);
        console.log(event.body);
        const parsedEventBody = JSON.parse(jsonString);

        console.log("coinbase:", parsedEventBody);
        // Parse the inner JSON string
        const parsedInnerBody = JSON.parse(parsedEventBody);
        console.log(parsedInnerBody); // This should log "BUY, 1INCH-USD, 0.4138"

        const actionDetails = parsedInnerBody.resp.split(', ');
        console.log("Action Details: " + actionDetails);

        const action = actionDetails[0]; // "BUY"
        const asset = actionDetails[1];  // "1INCH-USD"
        let price = actionDetails[2].toString();  // "0.4138"
        let stopPrice = actionDetails[3].toString();
        let limit_price = actionDetails[4].toString();
        const symbol = asset.split('-')[0];  // "1INCH"
        const token = await generateToken();
        // const tokenGET = await generateTokenGET();
        const accountToken = await generateTokenAccount();
        let accountUUID = "";
        //let accounts = await listAccounts(accountToken);

        //if (accounts && accounts.length > 0) {
        //    accounts.forEach(account => {
        //        if (account.currency.includes(symbol)) {
        //            console.log(`Account Name: ${account.name}, UUID: ${account.uuid}`);
        //            accountUUID = account.uuid;
        //        }
        //    });

        //    const accountTokenInch = await generateTokenAccount1Inch(accountUUID);
        //  let accDetails =  await getAccountDetails(accountTokenInch, accountUUID);
        //} else {
        //    console.log("No accounts found.");       
        //}
        price = truncateStringNumber(price, 2);

        if (action.includes('BUY')) {
            const buyResponse = await StopLossOrder(action, price, asset, symbol, token, stopPrice, limit_price);
            return {
                statusCode: 200,
                body: JSON.stringify(buyResponse.data)
            };
        }

        else if (action.includes('SELL')) {
            let accounts = await listAccounts(accountToken);
            let amount;
        if (accounts && accounts.length > 0) {
            accounts.forEach(account => {
                if (account.currency.includes(symbol)) {
                    console.log(`Account Name: ${account.name}, UUID: ${account.uuid}`);
                    accountUUID = account.uuid;
                    amount = account.available_balance.value;
                    console.log("Found Account: Balance: " + amount);
                }
            });
        } else {
            console.log("No accounts found.");       
        }
            const sellResponse = await SellOrder(token,amount, asset)
            return {
                statusCode: 200,
                body: JSON.stringify(sellResponse.data)
            };
        }

        else {
            throw new Error('Invalid action');
        }
    }
    catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred', message: error.message })
        };
    }

};

// Function to truncate a string number to a specified number of decimal places
function truncateStringNumber(str, decimals) {
    const decimalIndex = str.indexOf('.');
    if (decimalIndex === -1) {
        // No decimal point, return the original string
        return str;
    }
    // Calculate the position to cut the string
    const endIndex = decimalIndex + decimals + 1;
    // Return the substring up to the specified number of decimal places
    return str.substring(0, endIndex);
}

function calculateBaseSize(price) {
    const targetAmount = 100; // $100 target
    let baseSize = targetAmount / price;

    // Round down to avoid exceeding $1000
    baseSize = Math.floor(baseSize);

    // Ensure baseSize is at least 1
    return Math.max(1, baseSize);
}