# 🤖 Starknet Buy Bot - Complete Setup Guide

A comprehensive buy bot for Starknet tokens that monitors large trades and sends beautiful alerts to your Telegram channel. This guide walks you through EVERY step needed to deploy your own buy bot from scratch.

## 📋 Table of Contents

- [What This Bot Does](#what-this-bot-does)
- [Prerequisites](#prerequisites)
- [Step 1: Clone and Setup Project](#step-1-clone-and-setup-project)
- [Step 2: Create Telegram Bot](#step-2-create-telegram-bot)
- [Step 3: Setup Database (Supabase)](#step-3-setup-database-supabase)
- [Step 4: Get Token Information](#step-4-get-token-information)
- [Step 5: Configuration](#step-5-configuration)
- [Step 6: Local Testing](#step-6-local-testing)
- [Step 7: Deployment Options](#step-7-deployment-options)
- [Advanced Configuration](#advanced-configuration)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## 🎯 What This Bot Does

This bot continuously monitors a Starknet token pool and:
- ✅ Detects large buy transactions above your USD threshold
- ✅ Sends beautiful formatted alerts to your Telegram channel
- ✅ Includes token price, market cap, liquidity, and transaction links
- ✅ Shows animated GIFs and hype messages (optional)
- ✅ Provides buy buttons linking to your preferred DEX
- ✅ Prevents duplicate alerts using database tracking

**Example Alert:**
```
🤖 BROTHER Buy!

🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
...

💰 4,928.21 USDT ($4,946.22)
🪙 613,322 BROTHER
🏷 Price: $0.008064
🔺 Market Cap $42,852,311
💧 Liquidity $472,787.71
🔍 0x20...fef0

HODL on! 🚀

TX | Chart | Website | Telegram
[BUY BROTHER]
```

## 🔧 Prerequisites

Before starting, make sure you have:

- **Computer**: Windows, Mac, or Linux
- **Node.js**: Version 18+ ([Download here](https://nodejs.org/))
- **Code Editor**: VS Code recommended ([Download here](https://code.visualstudio.com/))
- **Telegram Account**: To create the bot
- **Email**: For Supabase account
- **Basic Command Line Knowledge**: Copy/paste commands

**Check if Node.js is installed:**
```bash
node --version
```
Should show something like `v18.17.0` or higher.

## 🚀 Step 1: Clone and Setup Project

1. **Open Terminal/Command Prompt**
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
   - **Linux**: Press `Ctrl + Alt + T`

2. **Clone the project:**
   ```bash
   git clone https://github.com/your-repo/starknet-degen-tools.git
   cd starknet-degen-tools/starknet-buy-bot
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```
   This will take 1-2 minutes and install all required packages.

## 🤖 Step 2: Create Telegram Bot

1. **Open Telegram** (mobile or desktop)

2. **Find BotFather:**
   - Search for `@BotFather`
   - Start a chat with the official BotFather bot

3. **Create new bot:**
   ```
   /newbot
   ```

4. **Choose bot name:**
   - Enter your bot's display name (e.g., "MyToken Buy Bot")
   - Enter username ending in "bot" (e.g., "mytoken_buy_bot")

5. **Save your bot token:**
   - BotFather will give you a token like: `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ`
   - **IMPORTANT**: Copy this token and save it somewhere safe!

6. **Create/Find your channel:**
   - Create a new channel or use existing one
   - Add your bot as admin with "Post Messages" permission
   - Get channel username (e.g., `@mytokenchannel`) or Chat ID

7. **Get Chat ID (if using private channel):**
   - Add `@userinfobot` to your channel
   - Send any message, it will reply with Chat ID (e.g., `-1001234567890`)

## 💾 Step 3: Setup Database (Supabase)

The bot needs a database to track which transactions it has already alerted on.

1. **Create Supabase Account:**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with email/GitHub

2. **Create New Project:**
   - Click "New project"
   - Choose organization (or create one)
   - Enter project name (e.g., "buy-bot-db")
   - Enter database password (save this!)
   - Choose region (pick closest to your server location)
   - Click "Create new project"

3. **Wait for Setup:**
   - Takes 2-3 minutes to provision
   - You'll see "Setting up project..." status

4. **Create Database Table:**
   - Go to "SQL Editor" in sidebar
   - Click "New query"
   - Paste this SQL:
   ```sql
   CREATE TABLE bot_state (
     id SERIAL PRIMARY KEY,
     last_block_number BIGINT,
     last_tx_hash TEXT,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   INSERT INTO bot_state (last_block_number, last_tx_hash) 
   VALUES (0, '');
   ```
   - Click "Run" button

5. **Get Database Credentials:**
   - Go to "Settings" → "API"
   - Copy "Project URL" (looks like: `https://abcdefgh.supabase.co`)
   - Copy "service_role" key (NOT anon key!)
   - **IMPORTANT**: Save both values securely!

## 🪙 Step 4: Get Token Information

You need specific addresses and pool information for your token.

1. **Find Your Token:**
   - Go to [GeckoTerminal](https://geckoterminal.com/starknet-alpha/pools)
   - Search for your token
   - Click on the trading pair (e.g., TOKEN/ETH)

2. **Get Pool Address:**
   - Look at the URL: `https://geckoterminal.com/starknet-alpha/pools/0x123abc...`
   - The long hex string after `/pools/` is your POOL_ADDRESS
   - Copy the entire address (starts with `0x`)

3. **Get Token Address:**
   - On the pool page, look for token contract address
   - Usually shown under token name or in "Token Info" section
   - Copy the token contract address

4. **Verify Network:**
   - Make sure it shows "starknet-alpha" in the URL
   - This is the network ID we'll use

## ⚙️ Step 5: Configuration

1. **Create Environment File:**
   ```bash
   # In your project folder, create .env file
   touch .env
   ```

2. **Edit the .env file:**
   Open `.env` in your text editor and add:

   ```env
   # ====================================
   # REQUIRED SETTINGS - MUST CONFIGURE
   # ====================================
   
   # Telegram Bot (from Step 2)
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ
   TELEGRAM_CHAT_ID=@yourtokenchannel
   
   # Database (from Step 3)
   SUPABASE_URL=https://abcdefgh.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # Token Information (from Step 4)
   POOL_ADDRESS=0x1234567890abcdef...
   TOKEN_ADDRESS=0x9876543210fedcba...
   TOKEN_SYMBOL=BROTHER
   
   # ====================================
   # OPTIONAL SETTINGS - DEFAULTS PROVIDED
   # ====================================
   
   # Monitoring Settings
   NETWORK_ID=starknet-alpha
   THRESHOLD_USD=1000
   POLL_INTERVAL_MS=5000
   
   # Branding
   BANNER_EMOJI=👊
   TAG_LINE=BUY
   
   # Links (optional)
   SWAP_URL=https://app.ekubo.org/pool/${POOL_ADDRESS}
   CHART_URL=https://geckoterminal.com/starknet-alpha/pools/${POOL_ADDRESS}
   WEBSITE_URL=https://yourtoken.com
   TWITTER_URL=https://twitter.com/yourtoken
   TELEGRAM_LINK=https://t.me/yourtoken
   
   # Hype Assets (optional JSON arrays)
   HYPE_GIFS=["https://media.giphy.com/media/abc123/giphy.gif"]
   HYPE_LINES=["HODL on!", "To the moon!", "Diamond hands!", "LFG!"]
   ```

3. **Replace the Values:**
   - Replace `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ` with your actual bot token
   - Replace `@yourtokenchannel` with your channel username or chat ID
   - Replace `https://abcdefgh.supabase.co` with your Supabase URL
   - Replace the long Supabase key with your service_role key
   - Replace pool and token addresses with your actual addresses
   - Replace `BROTHER` with your token symbol
   - Update all URLs to match your project

4. **Configuration Explanations:**

   **Required Settings:**
   - `TELEGRAM_BOT_TOKEN`: Your bot's API token from BotFather
   - `TELEGRAM_CHAT_ID`: Your channel username or chat ID
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (NOT anon key)
   - `POOL_ADDRESS`: DEX pool contract address
   - `TOKEN_ADDRESS`: Your token's contract address
   - `TOKEN_SYMBOL`: Token symbol to display in messages

   **Optional Settings:**
   - `THRESHOLD_USD`: Minimum trade size to alert on (default: $1000)
   - `POLL_INTERVAL_MS`: How often to check for trades (default: 5 seconds)
   - `SWAP_URL`: Where "BUY" button links to
   - `CHART_URL`: Chart link in messages
   - `HYPE_GIFS`: Array of GIF URLs for animated messages
   - `HYPE_LINES`: Array of hype text to randomize

## 🧪 Step 6: Local Testing

Let's make sure everything works before deploying!

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Test configuration:**
   ```bash
   npm run serve
   ```

3. **Check the logs:**
   - You should see: "Bot starting up…"
   - Then: "Initializing Gecko poll loop…"
   - Then: "Loaded last seen state from DB"
   - If you see errors, check the Troubleshooting section below

4. **Test with lower threshold:**
   - Temporarily set `THRESHOLD_USD=1` in your .env
   - Restart the bot
   - Should detect smaller trades for testing
   - Check your Telegram channel for alerts
   - Remember to increase threshold back to desired amount

5. **Stop the bot:**
   - Press `Ctrl + C` to stop

## 🌐 Step 7: Deployment Options

Choose one deployment method based on your needs:

### Option A: Railway (Recommended for Beginners)

Railway is a cloud platform that makes deployment super easy.

1. **Create Railway Account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your bot repository

3. **Add Environment Variables:**
   - Go to your project dashboard
   - Click "Variables" tab
   - Add all variables from your .env file:
     - `TELEGRAM_BOT_TOKEN=...`
     - `TELEGRAM_CHAT_ID=...`
     - `SUPABASE_URL=...`
     - `SUPABASE_SERVICE_ROLE_KEY=...`
     - etc.

4. **Deploy:**
   - Railway automatically builds and deploys
   - Check logs to ensure it's running
   - Bot will restart automatically if it crashes

**Cost**: $5/month after free tier

### Option B: Heroku

1. **Install Heroku CLI:**
   - Download from [heroku.com/cli](https://devcenter.heroku.com/articles/heroku-cli)

2. **Login and create app:**
   ```bash
   heroku login
   heroku create your-buy-bot-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=your_token
   heroku config:set TELEGRAM_CHAT_ID=your_chat_id
   heroku config:set SUPABASE_URL=your_supabase_url
   # ... continue for all variables
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

**Cost**: $7/month for basic dyno

### Option C: DigitalOcean Droplet

1. **Create Droplet:**
   - Go to [digitalocean.com](https://digitalocean.com)
   - Create $5/month Ubuntu droplet

2. **Setup server:**
   ```bash
   # SSH into your droplet
   ssh root@your_droplet_ip
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs git
   
   # Clone and setup
   git clone https://github.com/your-repo/starknet-degen-tools.git
   cd starknet-degen-tools/starknet-buy-bot
   npm install
   ```

3. **Add environment variables:**
   ```bash
   nano .env
   # Paste your configuration
   ```

4. **Setup PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "buy-bot" -- start
   pm2 startup
   pm2 save
   ```

**Cost**: $5/month

### Option D: VPS (Virtual Private Server)

Similar to DigitalOcean but use providers like:
- **Linode**: $5/month
- **Vultr**: $5/month  
- **AWS Lightsail**: $3.50/month
- **Google Cloud**: Free tier available

Follow similar steps as DigitalOcean option.

## 🎛️ Advanced Configuration

### Custom Hype Messages

Add personality to your bot with custom hype lines:

```env
HYPE_LINES=["HODL STRONG! 💎", "We're going to the moon! 🚀", "Diamond hands only! 💎🙌", "This is the way! 🔥", "LFG! 🚀🚀🚀"]
```

### Animated GIFs

Make alerts more engaging with GIFs:

```env
HYPE_GIFS=["https://media.giphy.com/media/3oz8xQYqjIS3kkPfY4/giphy.gif", "https://media.giphy.com/media/YnkMcHgNIMW4Yfmjxr/giphy.gif"]
```

**Finding GIF URLs:**
1. Go to [giphy.com](https://giphy.com)
2. Find your GIF
3. Right-click → "Copy image address"
4. Add to HYPE_GIFS array

### Multiple Threshold Alerts

Want different thresholds? Run multiple bot instances:

1. **Copy bot folder:**
   ```bash
   cp -r starknet-buy-bot starknet-buy-bot-whales
   cd starknet-buy-bot-whales
   ```

2. **Create separate .env:**
   ```env
   # Same settings but different threshold
   THRESHOLD_USD=10000
   TELEGRAM_CHAT_ID=@whale_alerts
   ```

3. **Deploy both instances**

### Custom Swap URLs

Point buy button to your preferred DEX:

```env
# Ekubo
SWAP_URL=https://app.ekubo.org/pool/${POOL_ADDRESS}

# 10KSwap  
SWAP_URL=https://10kswap.com/swap

# JediSwap
SWAP_URL=https://jediswap.xyz/swap
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. "Environment variable TELEGRAM_BOT_TOKEN is required but missing"**
- Check your .env file exists
- Ensure no spaces around = in .env
- Verify bot token is correct from BotFather

**2. "fetchTrades failed" or "fetchPoolMeta failed"**
- Verify POOL_ADDRESS is correct
- Check if pool exists on GeckoTerminal
- Ensure NETWORK_ID is "starknet-alpha"

**3. Bot runs but no alerts sent**
- Check THRESHOLD_USD - might be too high
- Verify your token has trading volume
- Test with THRESHOLD_USD=1 temporarily
- Check Telegram channel permissions

**4. "sendBuy: failed to send Telegram message"**
- Verify bot is admin in channel
- Check TELEGRAM_CHAT_ID format (@channel or -1001234567890)
- Test bot token with BotFather using /getMe

**5. Database connection errors**
- Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
- Check if table was created correctly
- Test connection from Supabase dashboard

**6. "Cannot find module" errors**
- Run `npm install` again
- Delete node_modules and run `npm install`
- Check Node.js version is 18+

**7. Bot stops running**
- Check server logs
- Use process managers (PM2, systemd)
- Monitor memory/CPU usage
- Check for rate limiting

### Testing Commands

**Test environment variables:**
```bash
node -e "require('dotenv/config'); console.log('Token:', process.env.TELEGRAM_BOT_TOKEN?.slice(0,10) + '...')"
```

**Test database connection:**
```bash
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
client.from('bot_state').select('*').then(r => console.log('DB:', r.data));
"
```

**Test Telegram bot:**
```bash
node -e "
const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
bot.getMe().then(r => console.log('Bot:', r));
"
```

### Log Analysis

The bot provides detailed logs. Key log messages:

- ✅ `"Bot starting up…"` - Bot initialized
- ✅ `"Loaded last seen state from DB"` - Database connected
- ✅ `"fetchPoolMeta: fetched pool metadata"` - Pool data loaded
- ✅ `"New BUY trade detected"` - Found qualifying trade
- ✅ `"sendBuy: message dispatched successfully"` - Alert sent
- ❌ `"fetchTrades failed"` - API issue
- ❌ `"sendBuy: failed to send Telegram message"` - Telegram issue

## 📞 Support

### Getting Help

**1. Check logs first:**
- Look for error messages
- Compare with examples above
- Note the exact error text

**2. Common solutions:**
- Restart the bot
- Check all environment variables
- Verify API keys haven't expired
- Test with lower threshold

**3. Community support:**
- GitHub Issues: [Create issue](https://github.com/your-repo/starknet-degen-tools/issues)
- Telegram: @yourcommunitychannel
- Discord: [Your Discord invite]

**4. When asking for help, include:**
- Operating system
- Node.js version (`node --version`)
- Exact error message
- Steps you've tried
- Environment variables (hide sensitive values)

### Maintenance

**Regular tasks:**
- Monitor bot performance
- Check for API rate limits
- Update token information if pool changes
- Backup database periodically
- Monitor hosting costs

**Updates:**
```bash
git pull origin main
npm install
npm run build
# Restart your deployment
```

---

## 🎉 Congratulations!

You now have a fully functional Starknet buy bot! 🚀

Your bot will:
- ✅ Monitor your token 24/7
- ✅ Send instant buy alerts
- ✅ Track large transactions
- ✅ Keep your community engaged
- ✅ Scale with your token's growth

**Next steps:**
1. Customize the hype messages for your community
2. Add animated GIFs for more engagement  
3. Set up monitoring for bot uptime
4. Share your setup with other projects
5. Consider running multiple bots for different thresholds

**Pro tip**: Join other token communities to see how they configure their buy bots for inspiration!

---

*Built with ❤️ for the Starknet ecosystem*

**Disclaimer**: This bot is for informational purposes only. Always verify transaction details independently. Not financial advice.