import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

if (!BOT_TOKEN || !APP_URL) {
    console.error('❌ Missing environment variables!')
    console.error('Make sure TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_APP_URL are set in .env.local')
    process.exit(1)
}

const WEBHOOK_URL = `${APP_URL}/api/telegram-webhook`

async function setupWebhook() {
    try {
        console.log('🔄 Setting up webhook...')
        console.log(`📍 Webhook URL: ${WEBHOOK_URL}`)

        // Delete existing webhook
        const deleteResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
        const deleteResult = await deleteResponse.json()
        console.log('🗑️  Deleted old webhook:', deleteResult.ok ? '✅' : '❌')

        // Set new webhook
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: WEBHOOK_URL,
                allowed_updates: ['message', 'callback_query', 'pre_checkout_query']
            })
        })

        const data = await response.json()

        if (data.ok) {
            console.log('✅ Webhook set successfully!')
        } else {
            console.error('❌ Failed to set webhook:', data.description)
        }

        // Get webhook info
        const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`)
        const info = await infoResponse.json()

        console.log('\n📊 Current webhook info:')
        console.log(`- URL: ${info.result.url || 'Not set'}`)
        console.log(`- Pending updates: ${info.result.pending_update_count || 0}`)
        console.log(`- Last error: ${info.result.last_error_message || 'None'}`)

        if (info.result.url === WEBHOOK_URL) {
            console.log('\n✅ Webhook is correctly configured!')
        } else {
            console.log('\n⚠️  Webhook URL mismatch!')
        }
    } catch (error) {
        console.error('❌ Error setting up webhook:', error)
    }
}

// Run the setup
setupWebhook()