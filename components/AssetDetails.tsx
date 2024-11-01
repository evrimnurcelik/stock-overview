'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Asset {
  symbol: string
  name: string
  price: number
  marketCap: number
  dayHigh: number
  dayLow: number
}

interface AssetDetailsProps {
  asset: Asset
  onBack: () => void
}

export default function AssetDetails({ asset, onBack }: AssetDetailsProps) {
  const [details, setDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/stockdata?endpoint=details&symbol=${asset.symbol}`)
      .then(res => res.json())
      .then(setDetails)
      .catch(err => setError(err.message))
  }, [asset.symbol])

  if (error) {
    return (
      <div className="bg-white border-4 border-black p-8">
        <h2 className="text-4xl font-bold mb-4 text-red-600 uppercase">{asset.symbol}</h2>
        <p className="text-2xl text-red-600 mb-4">{error}</p>
        <button 
          onClick={onBack} 
          className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-black hover:bg-white hover:text-black transition-colors"
        >
          BACK TO OVERVIEW
        </button>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="bg-white border-4 border-black p-8">
        <h2 className="text-4xl font-bold mb-4 text-black uppercase">{asset.symbol}</h2>
        <p className="text-2xl mb-4">Loading...</p>
      </div>
    )
  }

  const chartData = {
    labels: details.history.map((item: any) => item.date),
    datasets: [
      {
        label: 'Price',
        data: details.history.map((item: any) => item.close),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  return (
    <div className="bg-white border-4 border-black p-8">
      <h2 className="text-4xl font-bold mb-4 text-black uppercase">{asset.symbol}</h2>
      <div className="mb-4">
        <p className="text-2xl mb-2">{asset.name}</p>
        <p className="text-xl mb-1">Price: ${asset.price.toFixed(2)}</p>
        <p className="text-xl mb-1">Market Cap: ${(asset.marketCap / 1e9).toFixed(2)}B</p>
        <p className="text-xl mb-1">Day High: ${asset.dayHigh.toFixed(2)}</p>
        <p className="text-xl mb-1">Day Low: ${asset.dayLow.toFixed(2)}</p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4">Price Development (Last Month)</h3>
        <div className="border-4 border-black p-4">
          <Line data={chartData} />
        </div>
      </div>
      
      <button 
        onClick={onBack} 
        className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-black hover:bg-white hover:text-black transition-colors"
      >
        BACK TO OVERVIEW
      </button>
    </div>
  )
}