import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Asset {
  symbol: string
  companyName: string
  latestPrice: number
  change?: number
  changePercent?: number
}

interface AssetDetailsProps {
  asset: Asset
  onBack: () => void
}

interface DetailedAssetData {
  marketCap: number
  peRatio: number
  dividendYield: number
  sector: string
  industry: string
}

interface HistoricalData {
  date: string
  close: number
}

const fetchAssetDetails = async (symbol: string): Promise<DetailedAssetData> => {
  const response = await fetch(`/api/stockdata?endpoint=stock/metric&symbol=${symbol}`);
  const data = await response.json();

  return {
    marketCap: data.metric.marketCapitalization,
    peRatio: data.metric.peBasicExclExtraTTM,
    dividendYield: data.metric.dividendYieldIndicatedAnnual,
    sector: data.metric.sector,
    industry: data.metric.industry
  };
}

const fetchHistoricalData = async (symbol: string): Promise<HistoricalData[]> => {
  const to = Math.floor(Date.now() / 1000);
  const from = to - 30 * 24 * 60 * 60; // 30 days ago
  const response = await fetch(`/api/stockdata?endpoint=stock/candle&symbol=${symbol}&resolution=D&from=${from}&to=${to}`);
  const data = await response.json();

  return data.t.map((timestamp: number, index: number) => ({
    date: new Date(timestamp * 1000).toISOString().split('T')[0],
    close: data.c[index]
  }));
}

export default function AssetDetails({ asset, onBack }: AssetDetailsProps) {
  const [details, setDetails] = useState<DetailedAssetData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAssetDetails(asset.symbol),
      fetchHistoricalData(asset.symbol)
    ]).then(([detailsData, historicalData]) => {
      setDetails(detailsData);
      setHistoricalData(historicalData);
    }).catch(err => setError(err.message));
  }, [asset.symbol]);

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
    );
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
    );
  }

  return (
    <Card className="bg-white border-4 border-black p-8">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-red-600">{asset.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl mb-4">{asset.companyName}</p>
        <p className="text-xl">Price: ${asset.latestPrice?.toFixed(2) ?? 'N/A'}</p>
        <p className={`text-xl ${(asset.changePercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Change: {asset.changePercent?.toFixed(2) ?? 'N/A'}%
        </p>
        <p className="text-xl">Market Cap: ${details.marketCap?.toLocaleString() ?? 'N/A'}</p>
        <p className="text-xl">P/E Ratio: {details.peRatio?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl">Dividend Yield: {(details.dividendYield ? (details.dividendYield * 100).toFixed(2) : 'N/A')}%</p>
        <p className="text-xl">Sector: {details.sector || 'N/A'}</p>
        <p className="text-xl">Industry: {details.industry || 'N/A'}</p>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-4">Price Development (Last 30 Days)</h2>
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
  );
}