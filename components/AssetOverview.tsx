'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import AssetDetails from './AssetDetails'

interface Asset {
  symbol: string
  companyName: string
  latestPrice: number
  change?: number
  changePercent?: number
}

const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'BRK.A', 'V', 'JNJ', 'WMT'];

const fetchAssetData = async (symbol: string): Promise<Asset> => {
  const quoteResponse = await fetch(`/api/stockdata?endpoint=quote&symbol=${symbol}`);
  const quoteData = await quoteResponse.json();

  if (quoteData.error) {
    throw new Error(quoteData.error);
  }

  const profileResponse = await fetch(`/api/stockdata?endpoint=stock/profile2&symbol=${symbol}`);
  const profileData = await profileResponse.json();

  if (profileData.error) {
    throw new Error(profileData.error);
  }

  return {
    symbol: symbol,
    companyName: profileData.name || 'Unknown',
    latestPrice: quoteData.c || 0,
    change: quoteData.d || 0,
    changePercent: quoteData.dp || 0
  };
}

const fetchTopAssets = async (): Promise<Asset[]> => {
  try {
    const assets = await Promise.all(symbols.map(fetchAssetData));
    return assets.sort((a, b) => b.latestPrice - a.latestPrice);
  } catch (error) {
    console.error('Error fetching top assets:', error);
    throw error;
  }
}

export default function AssetOverview() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopAssets().then(setAssets).catch(err => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-200 p-8 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-red-600">Error</h1>
        <div className="text-red-600 text-2xl font-bold">{error}</div>
        <p className="mt-4">
          {error.includes('API access denied') 
            ? 'It seems there\'s an issue with the API key or account permissions. Please contact the administrator.'
            : 'An unexpected error occurred. Please try again later or contact support if the problem persists.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-200 p-8 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-red-600">Top 10 Stocks</h1>
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
                <p className="text-xl">{asset.companyName}</p>
                <p className="text-lg">Price: ${asset.latestPrice?.toFixed(2) ?? 'N/A'}</p>
                <p className={`text-lg ${(asset.changePercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Change: {asset.changePercent?.toFixed(2) ?? 'N/A'}%
                </p>
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
  );
}