// Import the binance-api-node library
const Binance = require('binance-api-node').default;

// Create a Binance client with your API Key and Secret
const client = Binance({
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET,
    futures: true,
});

// Function to get account information (Futures USDⓈ-M)
async function getFuturesAccountInfo() {
    try {
        console.log("Getting binance Accunt info now");
        const accountInfo = await client.futuresAccountInfo();
        console.log('Futures Account Info:', accountInfo);
    } catch (error) {
        console.error('Error getting Futures account info:', error);
    }
}

// Function to get futures position information (USDⓈ-M)
async function getFuturesPositionInfo() {
    try {
        const positions = await client.futuresPositionRisk();
        console.log('Futures Positions:', positions);
    } catch (error) {
        console.error('Error getting Futures positions:', error);
    }
}

// Function to place a market order in Futures (USDⓈ-M)
async function placeMarketOrder(symbol, side, quantity) {
    try {
        const order = await client.futuresOrder({
            symbol: symbol,
            side: side, // 'BUY' or 'SELL'
            type: 'MARKET',
            quantity: quantity,
        });
        console.log('Market Order:', order);
    } catch (error) {
        console.error('Error placing Futures market order:', error);
    }
}

exports.handler = async function (event, context) {
    console.log("entered");
    console.log(event.body);
    try {
        await getFuturesAccountInfo();
    }
    catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred', message: error.message })
        };
    }

};

async function makeLongTrade(symbol, position, leverage) {
    try {
        // Choose the symbol to trade, e.g., BTCUSDT
        //const symbol = 'BTCUSDT';

        // Set desired leverage
        //const leverage = 10;
        await client.futuresLeverage({ symbol: symbol, leverage: leverage });

        // Set stop loss percentage (e.g., 2% below entry price)
        const stopLossPercentage = 0.02; // 2%

        const marginType = 'ISOLATED'; // 'CROSS' for Cross margin or 'ISOLATED' for Isolated margin
        // Step 1: Set margin mode for the symbol (either 'ISOLATED' or 'CROSS')
        //await client.futuresMarginType({
        //    symbol: symbol,
        //    marginType: marginType,
        //});

        // Get futures account balance
        const balances = await client.futuresAccountBalance();
        // Find the USDT balance
        const usdtBalanceObj = balances.find((b) => b.asset === 'USDT');
        const totalUSDTBalance = parseFloat(usdtBalanceObj.balance);

        // Calculate 10% of the balance to use
        const amountToUse = totalUSDTBalance * 0.10;

        // Get the current mark price of the symbol
        const ticker = await client.futuresMarkPrice({ symbol });
        const currentPrice = parseFloat(ticker.markPrice);

        let targetProfitPercentage = 50; // Desired profit on capital
        if (leverage >= 15) {
            targetProfitPercentage = 25;
        }

        else if (leverage > 10) {
            targetProfitPercentage = 30;
        }
        const requiredPriceMovement = targetProfitPercentage / leverage; // Calculate required price movement

        // Get symbol info to determine precision and limits
        const exchangeInfo = await client.futuresExchangeInfo();
        const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === symbol);


        // Get the LOT_SIZE filter to adjust quantity
        const lotSizeFilter = symbolInfo.filters.find(
            (f) => f.filterType === 'LOT_SIZE'
        );
        const stepSize = parseFloat(lotSizeFilter.stepSize);
        const minQty = parseFloat(lotSizeFilter.minQty);

        // Calculate the quantity to buy considering leverage
        let quantity = (amountToUse * leverage) / currentPrice;

        // Adjust quantity to be a multiple of step size
        quantity = roundToStepSize(quantity, stepSize);
        if (quantity < minQty) {
            console.error(
                'Calculated quantity is less than the minimum quantity allowed.'
            );
            return;
        }

        let order;

        if (position == "LONG") {
            // Place a market order to open a long position
            order = await client.futuresOrder({
                symbol: symbol,
                side: 'BUY',
                type: 'MARKET',
                quantity: quantity.toString(), // Adjust decimal places as per step size
            });
        }

        else {
            // Place a market order to open a short position
            order = await client.futuresOrder({
                symbol: symbol,
                side: 'SELL',
                type: 'MARKET',
                quantity: quantity.toString(), // Adjust decimal places as per step size
            });
        }



        console.log('Order placed successfully:', order);

        // Calculate stop loss price
        let stopLossPrice;
        let takeProfitPrice;
        if (position == "LONG") {
            stopLossPrice = currentPrice * (1 - stopLossPercentage);
            takeProfitPrice = currentPrice * (1 + requiredPriceMovement / 100);
        }

        else {
            stopLossPrice = currentPrice * (1 + stopLossPercentage);
            takeProfitPrice = currentPrice * (1 - requiredPriceMovement / 100);
        }



        // Get the PRICE_FILTER to adjust prices
        const priceFilter = symbolInfo.filters.find(
            (f) => f.filterType === 'PRICE_FILTER'
        );
        const tickSize = parseFloat(priceFilter.tickSize);

        // Adjust stop loss and take profit prices to comply with tick size
        const adjustedStopLossPrice = roundToTickSize(stopLossPrice, tickSize);
        const adjustedTakeProfitPrice = roundToTickSize(takeProfitPrice, tickSize);

        // Place a stop loss order
        let stopOrder;
        if (position == "LONG") {
            stopOrder = await client.futuresOrder({
                symbol: symbol,
                side: 'SELL',
                type: 'STOP_MARKET',
                stopPrice: adjustedStopLossPrice.toString(),
                quantity: quantity.toString(),
                reduceOnly: true,
                timeInForce: 'GTC',
            });
        }

        else {
            stopOrder = await client.futuresOrder({
                symbol: symbol,
                side: 'BUY',
                type: 'STOP_MARKET',
                stopPrice: adjustedStopLossPrice.toString(),
                quantity: quantity.toString(),
                reduceOnly: true,
                timeInForce: 'GTC',
            });
        }
        console.log('Stop loss order placed:', stopOrder);

        // Step 5: Place a take profit order (Take-Profit-Market)
        let takeProfitOrder;
        if (position == "LONG") {
            takeProfitOrder = await client.futuresOrder({
                symbol: symbol,
                side: 'SELL', // Opposite side of the main order
                type: 'TAKE_PROFIT_MARKET',
                stopPrice: adjustedTakeProfitPrice.toString(),
                quantity: quantity.toString(),
                reduceOnly: true,
                timeInForce: 'GTC',
            });

        }

        else {
            takeProfitOrder = await client.futuresOrder({
                symbol: symbol,
                side: 'BUY', // Opposite side of the main order
                type: 'TAKE_PROFIT_MARKET',
                stopPrice: adjustedTakeProfitPrice.toString(),
                quantity: quantity.toString(),
                reduceOnly: true,
                timeInForce: 'GTC',
            });
        }

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

async function ProcessBinanceData(message) {
    console.log(message);
    try {
        // Split the message by commas and trim any extra spaces
        const parts = message.split(',').map(part => part.trim());
        // Assign the values to variables
        const direction = parts[0]; // "LONG"
        const symbol = parts[1];    // "VOUSDT"
        const price = parseFloat(parts[2]);    // 45.50 (as a number)
        const leverage = parseInt(parts[3].replace('Leverage ', '')); // 15 (as a number)
        // Output to see the result
        console.log('Direction:', direction);
        console.log('Symbol:', symbol);
        console.log('Price:', price);
        console.log('Leverage:', leverage);
        const positions = await client.futuresPositionRisk();
        const openPositions = positions.filter(position => parseFloat(position.positionAmt) !== 0);
        console.log(positions[0].symbol);
        const hasPosition = openPositions.some(position => position.symbol === symbol)
        if (hasPosition != true) {
            makeLongTrade(symbol, direction, leverage);
        }

        //await getFuturesAccountInfo();
    }
    catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred', message: error.message })
        };
    }

}

// Function to calculate the precision
function getPrecision(number) {
    const numberString = number.toString();
    if (numberString.indexOf('e-') > -1) {
        const [base, trail] = numberString.split('e-');
        return parseInt(trail, 10);
    } else if (numberString.indexOf('.') > -1) {
        return numberString.split('.')[1].length;
    } else {
        return 0;
    }
}

// Function to round to step size
function roundToStepSize(quantity, stepSize) {
    const precision = getPrecision(stepSize);
    return parseFloat((Math.floor(quantity / stepSize) * stepSize).toFixed(precision));
}

// Function to round to tick size
function roundToTickSize(price, tickSize) {
    const precision = getPrecision(tickSize);
    return parseFloat((Math.floor(price / tickSize) * tickSize).toFixed(precision));
}



module.exports = { ProcessBinanceData };