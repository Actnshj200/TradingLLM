# AI Crypto Trading Bot

An automated crypto trading bot deployed on Netlify. TradingView price alerts trigger GPT-4 analysis, which generates BUY/SELL signals that are executed automatically on Binance Futures and Coinbase Advanced Trade.

## How It Works

```
TradingView Alert
      │
      ▼
tradingview-webhook  ──►  update-chatbot
                                │
                                ▼
                        hugging-face-api  ──►  GPT-4
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
               Binance.js             Coinbase.js
          (Futures: LONG/SHORT)   (Spot: BUY/SELL)
```

- **TradingView** sends a webhook alert to `/.netlify/functions/tradingview-webhook`
- The alert is forwarded to `update-chatbot`, which calls `processMessage`
- GPT-4 analyzes the market data and returns a structured signal: `DIRECTION, SYMBOL, PRICE, LEVERAGE`
- If the message contains "Binance", the signal is routed to `Binance.js` for futures execution; otherwise to `Coinbase.js` for spot execution
- The chatbot UI (`index.html`) also lets you manually trigger a buy via the Coinbase function

## Netlify Functions

| Function | Path | Purpose |
|---|---|---|
| `hugging-face-api` | `/.netlify/functions/hugging-face-api` | Core LLM handler — calls GPT-4 and routes to exchange |
| `Binance` | `/.netlify/functions/Binance` | Binance Futures orders (market, stop-loss, take-profit) |
| `Coinbase` | `/.netlify/functions/Coinbase` | Coinbase spot orders (stop-limit buy, market sell) |
| `tradingview-webhook` | `/.netlify/functions/tradingview-webhook` | Receives TradingView alert webhooks |
| `update-chatbot` | `/.netlify/functions/update-chatbot` | Relay endpoint that calls `processMessage` |

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd Netify-huggingface
npm install
```

### 2. Configure environment variables

Set these in **Netlify → Site Settings → Environment Variables**:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4 access required) |
| `BINANCE_API_KEY` | Binance API key (Futures enabled) |
| `BINANCE_API_SECRET` | Binance API secret |
| `COINBASE_KEY_NAME` | Coinbase CDP key name (`organizations/.../apiKeys/...`) |
| `COINBASE_KEY_SECRET` | Coinbase EC private key (PEM format) |
| `SITE_URL` | Your Netlify site URL, e.g. `https://yoursite.netlify.app` |

> **Never commit API keys to source control.** All secrets must be set as environment variables.

### 3. Deploy to Netlify

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or connect the repo to Netlify via the dashboard for automatic deploys on push.

### 4. Configure TradingView Webhook

In your TradingView alert, set the webhook URL to:

```
https://yoursite.netlify.app/.netlify/functions/tradingview-webhook
```

The alert message body should include the asset name (e.g. `BTC`, `ETH`) and ideally the word `Binance` to route to the futures handler.

## Binance Futures Logic

- Uses **10% of account USDT balance** per trade
- Leverage and take-profit target are set dynamically based on GPT-4 confidence
- Stop-loss: 2% from entry
- Take-profit: scales with leverage (50% target at low leverage, 25% at high leverage)
- Skips opening a position if one already exists for that symbol

## Coinbase Spot Logic

- **BUY**: Places a stop-limit order using the price/stop/limit values from GPT-4
- **SELL**: Looks up the full available balance of the asset and places a market sell

## Project Structure

```
├── index.html                  # Chatbot UI
├── netlify.toml                # Netlify build config and redirects
├── _redirects.txt              # Netlify redirects (same rules as netlify.toml)
├── package.json
└── Functions/
    ├── hugging-face-api.js     # GPT-4 integration and routing
    ├── Binance.js              # Binance Futures execution
    ├── Coinbase.js             # Coinbase Advanced Trade execution
    ├── tradingview-webhook.js  # TradingView alert receiver
    └── update-chatbot.js       # Webhook relay to processMessage
```

## Known Limitations

- `conversationHistory` in `hugging-face-api.js` is declared but not yet used — multi-turn conversation context is not implemented
- The chatbot UI references Webflow CSS/JS assets that are not included in this repo
- `_redirects.txt` and `netlify.toml` both define the same redirect rules; one can be removed
