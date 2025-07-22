'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [claiming, setClaiming] = useState(false)
  const [canClaim, setCanClaim] = useState(true)
  const [nextClaimTime, setNextClaimTime] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    // Get Telegram WebApp data
    const initTelegram = async () => {
      const WebApp = (await import('@twa-dev/sdk')).default
      WebApp.ready()

      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user)
        // Simulate some initial points
        setPoints(Math.floor(Math.random() * 1000))

        // Check claim status
        checkClaimStatus(WebApp.initDataUnsafe.user.id)
      }
    }

    initTelegram()
  }, [])

  // Update countdown timer
  useEffect(() => {
    if (!nextClaimTime || canClaim) return

    const updateTimer = () => {
      const now = Date.now()
      const diff = nextClaimTime - now

      if (diff <= 0) {
        setCanClaim(true)
        setTimeRemaining('')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer() // Initial update
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [nextClaimTime, canClaim])

  const checkClaimStatus = async (userId: number) => {
    try {
      const response = await fetch(`/api/claim-daily?userId=${userId}`)
      const data = await response.json()

      setCanClaim(data.canClaim)
      if (!data.canClaim && data.nextClaimTime) {
        setNextClaimTime(data.nextClaimTime)
      }
    } catch (error) {
      console.error('Failed to check claim status:', error)
    }
  }

  const claimDaily = async () => {
    if (!canClaim) return

    setClaiming(true)
    const WebApp = (await import('@twa-dev/sdk')).default

    try {
      const response = await fetch('/api/claim-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username || user?.first_name
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { points: newPoints } = data
        setPoints(prev => prev + newPoints)
        setCanClaim(false)
        setNextClaimTime(data.nextClaimTime)

        WebApp.showPopup({
          title: '🎉 Daily Reward!',
          message: `You claimed ${newPoints} points!`,
          buttons: [{ type: 'ok' }]
        })
      } else if (data.error === 'Already claimed') {
        setCanClaim(false)
        setNextClaimTime(data.nextClaimTime)

        WebApp.showPopup({
          title: '⏰ Already Claimed',
          message: data.message,
          buttons: [{ type: 'ok' }]
        })
      } else {
        WebApp.showPopup({
          title: '❌ Error',
          message: 'Something went wrong. Please try again.',
          buttons: [{ type: 'ok' }]
        })
      }
    } catch (error) {
      console.error('Claim error:', error)
      WebApp.showPopup({
        title: '❌ Error',
        message: 'Failed to claim reward. Please try again.',
        buttons: [{ type: 'ok' }]
      })
    } finally {
      setTimeout(() => setClaiming(false), 500)
    }
  }

  const buyPoints = async (amount: number, price: number) => {
    const WebApp = (await import('@twa-dev/sdk')).default

    try {
      // Create invoice on backend
      const response = await fetch('/api/buy-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          amount,
          price
        })
      })

      const data = await response.json()

      if (data.success && data.invoiceUrl) {
        // Open the invoice in Telegram
        WebApp.openInvoice(data.invoiceUrl, (status) => {
          if (status === 'paid') {
            // Update local points (in real app, fetch from server)
            setPoints(prev => prev + amount)

            WebApp.showPopup({
              title: '✅ Payment Successful!',
              message: `You got ${amount.toLocaleString()} points! Check your chat for the receipt.`,
              buttons: [{ type: 'ok' }]
            })
          } else if (status === 'cancelled') {
            console.log('Payment cancelled by user')
          } else if (status === 'failed') {
            WebApp.showPopup({
              title: '❌ Payment Failed',
              message: 'Something went wrong. Please try again.',
              buttons: [{ type: 'ok' }]
            })
          }
        })
      } else {
        WebApp.showPopup({
          title: '❌ Error',
          message: 'Failed to create payment. Please try again.',
          buttons: [{ type: 'ok' }]
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      WebApp.showPopup({
        title: '❌ Error',
        message: 'Something went wrong. Please try again.',
        buttons: [{ type: 'ok' }]
      })
    }
  }

  const formatNumber = (num: number) => {
    // This ensures consistent formatting regardless of locale
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-5">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Points Game
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Welcome back, {user?.first_name || 'Player'} 👋
          </p>
        </div>
      </div>

      {/* Points Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-center shadow-xl shadow-blue-500/20">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur rounded-full mb-4">
            <span className="text-3xl">💎</span>
          </div>
          <p className="text-sm text-white/80 mb-1">Your Balance</p>
          <div className="text-4xl font-bold text-white mb-1">
            {formatNumber(points)}
          </div>
          <p className="text-sm text-white/60">points</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 space-y-4">
        {/* Daily Reward */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Daily Reward</h2>
          <button
            onClick={claimDaily}
            disabled={claiming || !canClaim}
            className={`w-full py-4 rounded-xl font-medium transition-all transform ${!canClaim
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : claiming
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 hover:cursor-pointer active:scale-[0.98] shadow-lg shadow-green-500/25'
              }`}
          >
            {claiming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Claiming...
              </span>
            ) : !canClaim && timeRemaining ? (
              <span className="flex items-center justify-center gap-2">
                <span>⏰</span>
                Next claim in {timeRemaining}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🎁</span>
                Claim 100 Points
              </span>
            )}
          </button>
          {!canClaim && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Come back tomorrow for your daily reward!
            </p>
          )}
        </div>

        {/* Shop */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Buy Points</h2>
          <div className="space-y-2">
            {[
              { points: 1000, stars: 50, color: 'from-orange-400 to-red-500', shadow: 'shadow-orange-500/20' },
              { points: 5000, stars: 200, color: 'from-blue-400 to-indigo-500', shadow: 'shadow-blue-500/20' },
              { points: 10000, stars: 350, color: 'from-purple-400 to-pink-500', shadow: 'shadow-purple-500/20', badge: 'Best Value' },
            ].map((pack) => (
              <button
                key={pack.points}
                onClick={() => buyPoints(pack.points, pack.stars)}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 active:scale-[0.98] transition-all hover:cursor-pointer hover:shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${pack.color} rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${pack.shadow} group-hover:scale-110 transition-transform`}>
                      <span className="text-xl">⭐</span>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">
                        {formatNumber(pack.points)} points
                      </div>
                      <div className="text-sm text-gray-500">
                        {pack.stars} Stars
                      </div>
                    </div>
                  </div>
                  {pack.badge && (
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full font-medium shadow-sm">
                      {pack.badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pb-6 text-center">
        <p className="text-xs text-gray-400">
          Made with <span className="text-red-500">❤️</span> for Telegram
        </p>
      </div>
    </div>
  )
}