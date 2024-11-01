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
      <div className="min-h-screen bg-yellow-400 p-8 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-red-600 uppercase">Error</h1>
        <div className="text-red-600 text-2xl font-bold">{error}</div>
        <p className="mt-4 text-black">Please check your API key and endpoint configuration.</p>
        <pre className="mt-4 p-4 bg-white border-4 border-black overflow-auto text-red-600">
          {error}
        </pre>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-400 p-8 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-red-600 uppercase">Top 10 Stocks</h1>
      {selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <Card key={asset.symbol} className="bg-white border-4 border-black hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="border-b-4 border-black">
                <CardTitle className="text-3xl font-bold">{asset.symbol}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xl font-bold mb-2">{asset.name}</p>
                <p className="text-lg mb-1">Price: <span className="font-bold">${asset.price?.toFixed(2) ?? 'N/A'}</span></p>
                <p className="text-lg mb-1">Day High: <span className="font-bold">${asset.day_high?.toFixed(2) ?? 'N/A'}</span></p>
                <p className="text-lg mb-4">Day Low: <span className="font-bold">${asset.day_low?.toFixed(2) ?? 'N/A'}</span></p>
                <Button 
                  onClick={() => setSelectedAsset(asset)} 
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 border-b-4 border-gray-900 hover:border-gray-700 rounded-none text-lg uppercase"
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