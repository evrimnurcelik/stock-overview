'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import AssetDetails from './AssetDetails'

interface Asset {
  symbol: string
  name: string
  market_cap: number
  price: number
}

const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    const response = await fetch('/api/stockdata?endpoint=data/market')
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }
    return data.data.slice(0, 50).map((asset: { symbol: string; name: string; market_cap?: number; price?: number }) => ({
      symbol: asset.symbol,
      name: asset.name,
      market_cap: asset.market_cap || 0,
      price: asset.price || 0
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
      <div className="min-h-screen bg-yellow-200 p-8 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-red-600">Error</h1>
        <div className="text-red-600 text-2xl font-bold">{error}</div>
        <p className="mt-4">Please check your API key and endpoint configuration.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-8 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-red-600">Top 50 Stocks & ETFs</h1>
      {selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Card key={asset.symbol} className="bg-white border-4 border-black">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{asset.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl">{asset.name}</p>
                <p className="text-lg">Market Cap: ${asset.market_cap.toLocaleString()}</p>
                <p className="text-lg">Price: ${asset.price.toFixed(2)}</p>
                <Button 
                  onClick={() => setSelectedAsset(asset)} 
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-800 rounded"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}