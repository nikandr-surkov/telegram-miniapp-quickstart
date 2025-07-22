import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for demo purposes
const paymentSessions = new Map<string, any>()

export async function POST(req: NextRequest) {
    try {
        const { userId, amount, price } = await req.json()

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

        // Create a unique payload for this payment
        const payload = JSON.stringify({
            userId,
            amount,
            price,
            timestamp: Date.now()
        })

        // Store session temporarily
        paymentSessions.set(userId.toString(), { amount, price })

        // Create invoice link using Telegram Bot API
        const invoiceResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `${amount.toLocaleString()} Points`,
                description: `Get ${amount.toLocaleString()} points instantly!`,
                payload: payload,
                provider_token: '', // Empty for Telegram Stars
                currency: 'XTR', // Telegram Stars currency
                prices: [{
                    label: 'Points Package',
                    amount: price // Price in Stars
                }]
            })
        })

        const invoiceData = await invoiceResponse.json()

        if (!invoiceData.ok) {
            console.error('Failed to create invoice:', invoiceData)
            return NextResponse.json({
                error: 'Failed to create payment'
            }, { status: 500 })
        }

        console.log(`
💎 Payment Invoice Created
========================
User ID: ${userId}
Points: ${amount}
Stars: ${price}
Invoice URL: ${invoiceData.result}
        `)

        return NextResponse.json({
            success: true,
            invoiceUrl: invoiceData.result
        })
    } catch (error) {
        console.error('Error creating payment:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}