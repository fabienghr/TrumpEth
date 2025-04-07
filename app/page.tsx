'use client'

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import Image from "next/image"

// Price moved to server-side API route
// No constants needed here

// Define interface for wallet data
interface WalletData {
  balanceEth: string;
  ethPriceNow: string;
  usdNow: string;
  usdJan20: string;
  diff: string;
}

export default function Home() {
  const [wallet, setWallet] = useState("")
  const [loading, setLoading] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [data, setData] = useState<WalletData | null>(null)
  const [error, setError] = useState("")
  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const drillAudioRef = useRef<HTMLAudioElement | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-play background music on interaction
    const handleInteraction = () => {
      bgAudioRef.current?.play().catch(() => {})
      document.removeEventListener('click', handleInteraction)
    }
    document.addEventListener('click', handleInteraction)
    return () => document.removeEventListener('click', handleInteraction)
  }, [])

  const getWalletData = async () => {
    if (!wallet) return

    setError("")
    setData(null)
    setShowLoadingScreen(true)
    drillAudioRef.current?.play()
    bgAudioRef.current?.pause()

    // Wait 9 seconds before fetching
    setTimeout(async () => {
      setShowLoadingScreen(false)
      drillAudioRef.current?.pause()
      bgAudioRef.current?.play()

      setLoading(true)
      try {
        // Use our server-side API route instead of direct Etherscan API calls
        const response = await axios.get(`/api/wallet-data?address=${wallet}`)
        setData(response.data)
      } catch (error) {
        setError("Failed to fetch data. Check wallet address.")
        console.error("Error fetching wallet data:", error)
      }
      setLoading(false)
    }, 9000)
  }

  const shareOnTwitter = () => {
    // Prepare the text for the tweet
    const tweetText = "I've been Trumped...\nCheck how much you've been Trumped on https://trump-rekt-checker.vercel.app/";
    
    // Create the actual tweet text with the result data
    let resultText = "";
    if (data) {
      const lossAmount = parseFloat(data.diff) < 0 ? `${Math.abs(parseFloat(data.diff)).toFixed(2)}` : "";
      resultText = parseFloat(data.diff) < 0 
        ? `I lost $ ${lossAmount} since Trump became President! 😢\n\n`
        : "Somehow I gained money since Trump became President! 💸\n\n";
    }
    
    // Combine texts and encode for URL
    const fullText = encodeURIComponent(resultText + tweetText);
    
    // Open Twitter with pre-populated text
    window.open(`https://twitter.com/intent/tweet?text=${fullText}`, '_blank');
  }

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-between">
      {/* Background Music */}
      <audio ref={bgAudioRef} src="/YMCA.mp3" loop />
      <audio ref={drillAudioRef} src="/drillbabydrill.mp3" />

      {/* Loading overlay */}
      {showLoadingScreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 text-white flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 animate-pulse">Fetching your portfolio pain… 💀</h2>
            <p className="text-lg sm:text-xl">Trump&apos;s policies + Ethereum = RED candles 🩸</p>
        </div>
      )}

      {/* Main Wallet Checker */}
      <main className="z-10 mt-16 flex-grow flex items-start justify-center px-4">
        <Card className="p-6 w-full max-w-xl shadow-2xl space-y-4">
          <CardContent className="space-y-4">
            <h1 className="text-2xl font-bold text-center">Trump Rekt Wallet Checker</h1>

            <div className="space-y-2">
              <Label htmlFor="wallet">Enter your ETH wallet for the Trump Show</Label>
              <Input
                id="wallet"
                placeholder="0x..."
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              />
              <Button onClick={getWalletData} disabled={loading || !wallet} className="w-full">
                Show me the MONEY
              </Button>
              
              {/* Added attribution line with image */}
              <div className="text-center text-sm text-gray-600 mt-2">
                <p>Made with Love by</p>
                <a href="https://x.com/wifdev_" target="_blank" rel="noopener noreferrer" className="inline-block mt-1">
                  <Image 
                    src="/wifdev.jpg" 
                    alt="@wifdev_" 
                    width={100}
                    height={100}
                    className="mx-auto rounded-full w-20 h-20 object-cover"
                  />
                  <span className="text-blue-600 hover:underline block mt-1">@wifdev_</span>
                </a>
              </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {data && (
              <div className="pt-4 border-t space-y-1" ref={resultRef}>
                <p><strong>ETH Balance:</strong> {data.balanceEth} ETH</p>
                <p><strong>ETH Price Now:</strong> ${data.ethPriceNow}</p>
                <p><strong>Your Bag Today:</strong> ${data.usdNow}</p>
                <p><strong>Your Bag on Jan 20 (Pre-Trump):</strong> ${data.usdJan20}</p>
                <p className={`font-bold ${parseFloat(data.diff) < 0 ? "text-red-500" : "text-green-600"}`}>
                  {parseFloat(data.diff) < 0
                    ? `😢 You got Trumped: -$${Math.abs(parseFloat(data.diff))}`
                    : `💸 Somehow... you gained $${data.diff}`}
                </p>
                
                {/* Added Twitter share button */}
                <Button 
                  onClick={shareOnTwitter} 
                  className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  📱 Share on Twitter how much you ve been Trumped
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Trump GIFs at the bottom */}
      <div className="z-0 w-full flex justify-center gap-4 py-6 bg-white">
        <Image 
          src="/trump-dance.gif" 
          alt="Trump Dance" 
          width={256}
          height={256}
          className="w-48 sm:w-56 md:w-64 h-auto" 
        />
        <Image 
          src="/trump-dance.gif" 
          alt="Trump Dance" 
          width={256}
          height={256}
          className="w-48 sm:w-56 md:w-64 h-auto" 
        />
      </div>
    </div>
  )
}
