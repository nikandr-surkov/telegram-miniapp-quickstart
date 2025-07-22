import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for last claim times (in production, use a database)
const lastClaimTimes = new Map<string, number>()

export async function POST(req: NextRequest) {
    try {
        const { userId, username } = await req.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const userIdStr = userId.toString()
        const now = Date.now()
        const lastClaim = lastClaimTimes.get(userIdStr)

        // Check if user has claimed before and if 24 hours have passed
        if (lastClaim) {
            const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60)

            if (hoursSinceLastClaim < 24) {
                const hoursRemaining = Math.ceil(24 - hoursSinceLastClaim)
                const minutesRemaining = Math.ceil((24 - hoursSinceLastClaim) * 60) % 60

                console.log(`
    ⏰ Daily Claim - Already Claimed
    ================================
    User: ${username} (ID: ${userId})
    Last claim: ${new Date(lastClaim).toLocaleString()}
    Time remaining: ${hoursRemaining}h ${minutesRemaining}m
                `)

                return NextResponse.json({
                    error: 'Already claimed',
                    message: `You already claimed today! Come back in ${hoursRemaining}h ${minutesRemaining}m`,
                    nextClaimTime: lastClaim + (24 * 60 * 60 * 1000),
                    hoursRemaining,
                    minutesRemaining
                }, { status: 400 })
            }
        }

        // User can claim - update last claim time
        lastClaimTimes.set(userIdStr, now)
        const dailyPoints = 100

        console.log(`
    ✅ Daily Claim - Success
    ========================
    User: ${username} (ID: ${userId})
    Points awarded: ${dailyPoints}
    Claim time: ${new Date(now).toLocaleString()}
    Total users claimed: ${lastClaimTimes.size}
        `)

        // Send notification via bot
        if (userId) {
            const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: userId,
                    text: `🎁 You claimed ${dailyPoints} daily points!\n\nCome back tomorrow for more!`
                })
            }).catch(error => {
                console.error('Failed to send Telegram notification:', error)
            })
        }

        return NextResponse.json({
            success: true,
            points: dailyPoints,
            nextClaimTime: now + (24 * 60 * 60 * 1000),
            message: `You received ${dailyPoints} points!`
        })

    } catch (error) {
        console.error('Error in daily claim:', error)
        return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const userIdStr = userId.toString()
    const lastClaim = lastClaimTimes.get(userIdStr)
    const now = Date.now()

    if (!lastClaim) {
        return NextResponse.json({
            canClaim: true,
            message: 'You can claim your daily reward!'
        })
    }

    const hoursSinceLastClaim = (now - lastClaim) / (1000 * 60 * 60)
    const canClaim = hoursSinceLastClaim >= 24

    if (canClaim) {
        return NextResponse.json({
            canClaim: true,
            message: 'You can claim your daily reward!'
        })
    }

    const totalMinutesRemaining = (24 - hoursSinceLastClaim) * 60
    const hoursRemaining = Math.floor(totalMinutesRemaining / 60)
    const minutesRemaining = Math.floor(totalMinutesRemaining % 60)

    return NextResponse.json({
        canClaim: false,
        lastClaimTime: lastClaim,
        nextClaimTime: lastClaim + (24 * 60 * 60 * 1000),
        hoursRemaining,
        minutesRemaining,
        message: `Next claim in ${hoursRemaining}h ${minutesRemaining}m`
    })
}