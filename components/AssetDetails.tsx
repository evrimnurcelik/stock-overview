import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Asset {
  symbol: string
  name: string
  market_cap: number
  price: number
}

interface AssetDetailsProps {
  asset: Asset
  onBack: () => void
}

interface HistoricalData {
  date: string
  close: number
}

const fetchAssetDetails = async (symbol: string): Promise<HistoricalData[]> => {
  try {
    const response = await fetch(`/api/stockdata?endpoint=data/intraday/adjusted&symbol=${symbol}`)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
    }
    return data.data.map((item: { date: string; close: number }) => ({
      date: new Date(item.date).toLocaleDateString(),
      close: item.close
    }))
  } catch (error) {
    console.error('Error fetching asset details:', error)
    throw error
  }
}

export default function AssetDetails({ asset, onBack }: AssetDetailsProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAssetDetails(asset.symbol)
      .then(setHistoricalData)
      .catch(err => setError(err.message))
  }, [asset.symbol])

  if (error) {
    return (
      <Card className="bg-white border-4 border-black p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-red-600">{error}</p>
          <Button 
            onClick={onBack} 
            className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-800 rounded"
          >
            Back to Overview
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-4 border-black p-8">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-red-600">{asset.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl mb-4">{asset.name}</p>
        <p className="text-xl">Market Cap: ${asset.market_cap.toLocaleString()}</p>
        <p className="text-xl">Price: ${asset.price.toFixed(2)}</p>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Price Development</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" name="Close Price" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <Button 
          onClick={onBack} 
          className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-800 rounded"
        >
          Back to Overview
        </Button>
      </CardContent>
    </Card>
  )
}