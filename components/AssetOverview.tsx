'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import AssetDetails from './AssetDetails'

interface Asset {
  symbol: string
  name: string
  price: number
  day_high: number
  day_low: number
  day_open: number
  previous_close_price: number
}

const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch('/api/stockdata?endpoint=market/rankings')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Unexpected API response:', JSON.stringify(data, null, 2))
      throw new Error('Unexpected API response format')
    }
    
    return data.data.map((asset: any) => ({
      symbol: asset.symbol || 'Unknown',
      name: asset.name || asset.symbol || 'Unknown',
      price: asset.price || 0,
      day_high: asset.day_high || 0,
      day_low: asset.day_low || 0,
      day_open: asset.day_open || 0,
      previous_close_price: asset.previous_close_price || 0
    }))
  } catch (error) {
    console.error('Error fetching top assets:', error)
    throw error
  }
}

export default function AssetOverview() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTopAssets().then(setAssets).catch(err => setError(err.message))
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-300 p-4 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-black uppercase">Error</h1>
        <div className="text-red-600 text-2xl font-bold">{error}</div>
        <p className="mt-4">Please check your API key and endpoint configuration.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-300 p-4 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-black uppercase">Top 5 Stocks</h1>
      {selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="bg-white border-4 border-black p-4">
              <h2 className="text-3xl font-bold mb-2">{asset.symbol}</h2>
              <p className="text-xl mb-1">{asset.name}</p>
              <p className="text-lg mb-1">Price: ${asset.price?.toFixed(2) ?? 'N/A'}</p>
              <p className="text-lg mb-2">Day High: ${asset.day_high?.toFixed(2) ?? 'N/A'}</p>
              <p className="text-lg mb-2">Day Low: ${asset.day_low?.toFixed(2) ?? 'N/A'}</p>
              <Button 
                onClick={() => setSelectedAsset(asset)} 
                className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors"
              >
                VIEW DETAILS
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}