import { useState, useEffect } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Asset {
  symbol: string
  companyName: string
  latestPrice: number
  change: number
  changePercent: number
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
    marketCap: data.metric?.marketCapitalization || 0,
    peRatio: data.metric?.peBasicExclExtraTTM || 0,
    dividendYield: data.metric?.dividendYieldIndicatedAnnual || 0,
    sector: data.metric?.sector || 'Unknown',
    industry: data.metric?.industry || 'Unknown'
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
    const fetchData = async () => {
      try {
        const [detailsData, historicalData] = await Promise.all([
          fetchAssetDetails(asset.symbol),
          fetchHistoricalData(asset.symbol)
        ]);
        setDetails(detailsData);
        setHistoricalData(historicalData);
      } catch (error) {
        setError('Failed to fetch asset details. Please try again later.');
      }
    };

    fetchData();
  }, [asset.symbol]);

  if (error) {
    return (
      <div className="bg-white border-4 border-black p-4">
        <h2 className="text-4xl font-bold mb-4 text-black uppercase">Error</h2>
        <p className="text-2xl text-black">{error}</p>
        <button 
          onClick={onBack} 
          className="w-full mt-4 bg-black text-white font-bold py-2 px-4 border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors"
        >
          BACK TO OVERVIEW
        </button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="bg-white border-4 border-black p-4">
        <h2 className="text-4xl font-bold mb-4 text-black uppercase">Loading...</h2>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black p-4">
      <h2 className="text-4xl font-bold mb-4 text-black uppercase">{asset.symbol}</h2>
      <div className="mb-4">
        <p className="text-2xl mb-2">{asset.companyName}</p>
        <p className="text-xl mb-1">Price: ${asset.latestPrice.toFixed(2)}</p>
        <p className={`text-xl mb-1 ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          Change: {asset.changePercent.toFixed(2)}%
        </p>
        <p className="text-xl mb-1">Market Cap: ${details.marketCap.toLocaleString()}</p>
        <p className="text-xl mb-1">P/E Ratio: {details.peRatio.toFixed(2)}</p>
        <p className="text-xl mb-1">Dividend Yield: {details.dividendYield.toFixed(2)}%</p>
        <p className="text-xl mb-1">Sector: {details.sector}</p>
        <p className="text-xl mb-1">Industry: {details.industry}</p>
      </div>
      
      <div className="mt-8 mb-4">
        <h3 className="text-3xl font-bold mb-4 uppercase">Price Development (Last 30 Days)</h3>
        <div className="border-4 border-black p-2">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="close" name="Close Price" stroke="#000" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <button 
        onClick={onBack} 
        className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors"
      >
        BACK TO OVERVIEW
      </button>
    </div>
  );
}