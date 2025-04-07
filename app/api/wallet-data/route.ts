// Create this file at: app/api/wallet-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Store API key as environment variable
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const JAN20_PRICE = 3359.00;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('address');
  
  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }
  
  try {
    // Get wallet balance
    const balanceRes = await axios.get(
      `https://api.etherscan.io/api?module=account&action=balance&address=${walletAddress}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );
    const balanceEth = parseInt(balanceRes.data.result) / 1e18;
    
    // Get current ETH price
    const priceRes = await axios.get(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
    );
    const ethPriceNow = parseFloat(priceRes.data.result.ethusd);
    
    // Calculate values
    const usdNow = balanceEth * ethPriceNow;
    const usdJan20 = balanceEth * JAN20_PRICE;
    const diff = usdNow - usdJan20;
    
    return NextResponse.json({
      balanceEth: balanceEth.toFixed(5),
      ethPriceNow: ethPriceNow.toFixed(2),
      usdNow: usdNow.toFixed(2),
      usdJan20: usdJan20.toFixed(2),
      diff: diff.toFixed(2),
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet data' }, { status: 500 });
  }
}