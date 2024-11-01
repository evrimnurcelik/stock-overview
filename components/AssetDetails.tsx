import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AssetData {
  symbol: string
  name: string
  market_cap: number
  price: number
  volume: number
  priceHistory: { date: string; close: number }[]
}

interface AssetDetailsProps {
  asset: { symbol: string; name: string }
  onBack: () => void
}

const fetchAssetDetails = async (symbol: string): Promise<AssetData> => {
  if (!symbol) {
    throw new Error("Symbol is required")
  }

  try {
    const response = await fetch(`/api/stockdata?endpoint=data/quote?symbols=${symbol}`)
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }
    const quoteData = await response.json()
    if (quoteData.error) {
      throw new Error(quoteData.error)
    }

    const historyResponse = await fetch(`/api/stockdata?endpoint=data/eod?symbols=${symbol}&date_from=${getDateXDaysAgo(30)}&date_to=${getCurrentDate()}`)
    if (!historyResponse.ok) {
      const errorData = await historyResponse.json()
      throw new Error(errorData.error || `HTTP error! status: ${historyResponse.status}`)
    }
    const historyData = await historyResponse.json()
    if (historyData.error) {
      throw new Error(historyData.error)
    }

    return {
      ...quoteData.data[0],
      priceHistory: historyData.data.map((item: { date: string; close: number }) => ({
        date: item.date,
        close: item.close || 0
      }))
    }
  } catch (error) {
    console.error('Error fetching asset details:', error)
    throw error
  }
}

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

const getDateXDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

export default function AssetDetails({ asset, onBack }: AssetDetailsProps) {
  const [details, setDetails] = useState<AssetData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (asset && asset.symbol) {
      fetchAssetDetails(asset.symbol)
        .then(setDetails)
        .catch(err => setError(err.message))
    } else {
      setError("Invalid asset data")
    }
  }, [asset])

  if (error) {
    return (
      <Card className="bg-white border-4 border-black p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl text-red-600">{error}</p>
          <p className="mt-4">Please check your API key and endpoint configuration.</p>
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

  if (!details) {
    return (
      <Card className="bg-white border-4 border-black p-8">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-blue-600">Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl">Fetching asset details...</p>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow">
          <p className="label">{`Date: ${label}`}</p>
          <p className="value">{`Price: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white border-4 border-black p-8">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-red-600">{details.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl mb-4">{details.name}</p>
        <p className="text-xl">Market Cap: ${(details.market_cap || 0).toLocaleString()}</p>
        <p className="text-xl">Price: ${(details.price || 0).toFixed(2)}</p>
        <p className="text-xl">Volume: {(details.volume || 0).toLocaleString()}</p>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Price Development</h2>
          <ChartContainer
            config={{
              price: {
                label: "Price",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={details.priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="close" name="Price" stroke="var(--color-price)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
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