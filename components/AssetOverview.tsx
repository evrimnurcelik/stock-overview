'use client'

import { useState, useEffect } from 'react'
import AssetDetails from './AssetDetails'

interface Asset {
  symbol: string
  name: string
  price: number
  marketCap: number
  dayHigh: number
  dayLow: number
}

export default function AssetOverview() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetch('/api/stockdata?endpoint=top50')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAssets(data)
        } else {
          throw new Error('Received invalid data format from API')
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-yellow-400 p-8 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-red-600 uppercase">Top 50 Assets</h1>
      {error ? (
        <div className="text-red-600 text-2xl font-bold">{error}</div>
      ) : isLoading ? (
        <div className="text-2xl font-bold">Loading...</div>
      ) : selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <div key={asset.symbol} className="bg-white border-4 border-black p-4 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-3xl font-bold mb-2">{asset.symbol}</h2>
              <p className="text-xl mb-2">{asset.name}</p>
              <p className="text-lg mb-1">Price: ${asset.price.toFixed(2)}</p>
              <p className="text-lg mb-1">Market Cap: ${(asset.marketCap / 1e9).toFixed(2)}B</p>
              <button 
                onClick={() => setSelectedAsset(asset)} 
                className="w-full mt-4 bg-black text-white font-bold py-2 px-4 border-2 border-black hover:bg-white hover:text-black transition-colors"
              >
                VIEW DETAILS
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}