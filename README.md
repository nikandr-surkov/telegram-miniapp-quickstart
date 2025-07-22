# Telegram Mini App Starter

A simple Next.js 15 project demonstrating how to build a Telegram Mini App with bot integration and Telegram Stars payments.

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org) [![Telegram](https://img.shields.io/badge/Telegram-Mini_App-26A5E4?style=for-the-badge&logo=telegram)](https://core.telegram.org/bots/webapps)

</div>

## 🚀 Features

- **Telegram Mini App** with points game
- **Telegram Bot** with commands
- **Telegram Stars** payment integration
- **Daily rewards** with countdown timer
- **In-memory storage** (no database needed)
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## 📋 Prerequisites

- Node.js 18+ 
- Telegram account
- ngrok (for local development)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/nikandr-surkov/telegram-miniapp-quickstart.git
cd telegram-miniapp-quickstart
npm install
```

### 2. Create Telegram Bot

1. Message [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Save your bot token

### 3. Start Development Server

```bash
npm run dev
```

### 4. Set Up ngrok

In a new terminal:

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### 5. Configure Environment

Create `.env.local`:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app
```

**Important:** Restart your Next.js server after updating `.env.local`!

### 6. Setup Webhook

```bash
npm run webhook:setup
```

### 7. Configure Bot

In [@BotFather](https://t.me/botfather):
1. Send `/mybots` and select your bot
2. Go to Bot Settings → Menu Button
3. Click "Edit menu button title" and type "Play Game" 
4. Click "Edit menu button URL" and enter your ngrok URL from `.env.local`

### 8. Test Your App

Open your bot and click the menu button to launch the mini app!

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── buy-points/      # Stars payment
│   │   ├── claim-daily/     # Daily rewards
│   │   └── telegram-webhook/ # Bot webhook
│   ├── page.tsx             # Mini app UI
│   └── layout.tsx           # App layout
├── scripts/
│   ├── setup-webhook.ts     # Webhook setup
│   ├── webhook-info.ts      # Check webhook status
│   └── delete-webhook.ts    # Remove webhook
└── .env.local              # Your config
```

## 🎯 What You Can Learn

- ✅ Setting up a Telegram Mini App
- ✅ Creating a Telegram Bot
- ✅ Implementing Telegram Stars payments
- ✅ Handling webhooks in Next.js
- ✅ Building responsive Telegram UI

## 💎 Key Features Explained

### Daily Claims
Users can claim 100 points every 24 hours. The countdown timer shows when the next claim is available.

### Telegram Stars Payments
Real payment integration with test refunds. Users can buy points packages:
- 1,000 points = 50 Stars
- 5,000 points = 200 Stars  
- 10,000 points = 350 Stars

### Bot Commands
- `/start` - Welcome message with mini app button
- `/help` - Instructions
- `/refund RECEIPT_ID` - Test refund system

## 🔧 Development Tips

**When ngrok restarts:**
1. Copy new ngrok URL
2. Update `NEXT_PUBLIC_APP_URL` in `.env.local`
3. Restart Next.js server
4. Run `npm run webhook:setup`
5. Update URL in BotFather

## 🔧 Common Issues

**Bot not responding?**
- Check webhook is set correctly: `npm run webhook:info`
- Verify bot token is correct
- Make sure ngrok is running

**Mini app not loading?**
- Must use HTTPS (that's why we use ngrok)
- Open through Telegram, not regular browser
- Check `.env.local` has correct ngrok URL

**"WebApp is not defined" error?**
- You must open the app through Telegram
- This won't work in regular browsers

## 📚 Resources

- [Telegram Mini Apps Docs](https://core.telegram.org/bots/webapps)
- [Next.js Documentation](https://nextjs.org/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## Author
### Nikandr Surkov
- 🌐 Website: https://nikandr.com
- 📺 YouTube: https://www.youtube.com/@NikandrSurkov
- 📢 Telegram Channel: https://t.me/NikandrApps
- 📱 Telegram: https://t.me/nikandr_s
- 💻 GitHub: https://github.com/nikandr-surkov
- 🐦 Twitter: https://x.com/NikandrSurkov
- 💼 LinkedIn: https://www.linkedin.com/in/nikandr-surkov/
- ✍️ Medium: https://medium.com/@NikandrSurkov

---

Built with ❤️ for the Telegram developer community