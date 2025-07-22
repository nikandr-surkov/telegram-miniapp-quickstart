import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

if (!BOT_TOKEN) {
    console.error('❌ Missing TELEGRAM_BOT_TOKEN in .env.local')
    process.exit(1)
}

async function deleteWebhook() {
    try {
        console.log('🗑️  Deleting webhook...')

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`)
        const data = await response.json()

        if (data.ok) {
            console.log('✅ Webhook deleted successfully!')
        } else {
            console.error('❌ Failed to delete webhook:', data.description)
        }
    } catch (error) {
        console.error('Error deleting webhook:', error)
    }
}

deleteWebhook()