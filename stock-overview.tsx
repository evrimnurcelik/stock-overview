'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const API_KEY = 'pwCa3IbGkp8TGF780nAcokRVspzXgyUPdmKx8biA' // Replace with your actual API key
const BASE_URL = 'https://api.stockdata.org/v1'

async function fetchTopAssets() {
  const response = await fetch(`${BASE_URL}/data/market/rankings?api_token=${API_KEY}&sort_by=market_cap&sort_order=desc&limit=50`)
  if (!response.ok) {
    throw new Error('Failed to fetch top assets')
  }
  const data = await response.json()
  return data.data.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    market_cap: asset.market_cap,
    last_price: asset.price
  }))
}

async function fetchAssetDetails(symbol: string) {
  const [infoResponse, eodResponse] = await Promise.all([
    fetch(`${BASE_URL}/data/quote?symbols=${symbol}&api_token=${API_KEY}`),
    fetch(`${BASE_URL}/data/eod?symbols=${symbol}&api_token=${API_KEY}&date_from=${getDateNDaysAgo(30)}&date_to=${getCurrentDate()}`)
  ])

  if (!infoResponse.ok || !eodResponse.ok) {
    throw new Error('Failed to fetch asset details')
  }

  const infoData = await infoResponse.json()
  const eodData = await eodResponse.json()

  const assetInfo = infoData.data[0]
  return {
    symbol: assetInfo.symbol,
    name: assetInfo.name,
    market_cap: assetInfo.market_cap,
    last_price: assetInfo.price,
    historical_data: eodData.data.map(item => ({
      date: item.date,
      price: item.close
    }))
  }
}

function getCurrentDate() {
  return new Date().toISOString().split('T')[0]
}

function getDateNDaysAgo(n) {
  const date = new Date()
  date.setDate(date.getDate() - n)
  return date.toISOString().split('T')[0]
}

export default function StockOverview() {
  const [assets, setAssets] = useState([])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTopAssets()
      .then(data => {
        setAssets(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleAssetClick = async (symbol) => {
    setLoading(true)
    setError(null)
    try {
      const details = await fetchAssetDetails(symbol)
      setSelectedAsset(details)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-200 p-8 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-red-600 uppercase">Error</h1>
        <Card className="bg-red-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <p className="text-2xl">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-8 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-red-600 uppercase">Stock & ETF Overview</h1>
      
      {selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <AssetList assets={assets} onAssetClick={handleAssetClick} loading={loading} />
      )}
    </div>
  )
}

function AssetList({ assets, onAssetClick, loading }) {
  return (
    <Card className="bg-blue-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">Top 50 Assets by Market Cap</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-2xl">Loading...</p>
        ) : (
          <ul className="space-y-4">
            {assets.map((asset) => (
              <li key={asset.symbol} className="bg-white p-4 border-2 border-black">
                <Button 
                  onClick={() => onAssetClick(asset.symbol)}
                  className="w-full text-left bg-transparent hover:bg-yellow-100 text-black font-bold py-2 px-4 border-2 border-black"
                >
                  <span className="text-xl">{asset.symbol}</span> - {asset.name}
                  <span className="block">Market Cap: ${asset.market_cap ? asset.market_cap.toLocaleString() : 'N/A'}</span>
                  <span className="block">Last Price: ${asset.last_price ? asset.last_price.toFixed(2) : 'N/A'}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function AssetDetails({ asset, onBack }) {
  return (
    <Card className="bg-green-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <CardHeader>
        <CardTitle className="text-4xl font-bold">{asset.symbol} - {asset.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl mb-4">Market Cap: ${asset.market_cap ? asset.market_cap.toLocaleString() : 'N/A'}</p>
        <p className="text-2xl mb-4">Last Price: ${asset.last_price ? asset.last_price.toFixed(2) : 'N/A'}</p>
        
        <h3 className="text-3xl font-bold mb-4">Price Development (Last 30 Days)</h3>
        <ChartContainer
          config={{
            price: {
              label: "Price",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px] border-2 border-black bg-white"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={asset.historical_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="price" stroke="var(--color-price)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <Button 
          onClick={onBack}
          className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Back to List
        </Button>
      </CardContent>
    </Card>
  )
}