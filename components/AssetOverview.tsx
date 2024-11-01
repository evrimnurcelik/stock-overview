'use client'

import { useState, useEffect } from 'react'
import AssetDetails from './AssetDetails'

interface Asset {
  symbol: string
  companyName: string
  latestPrice: number
  change: number
  changePercent: number
}

const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META'];

const fetchAssetData = async (symbol: string): Promise<Asset> => {
  const quoteResponse = await fetch(`/api/stockdata?endpoint=quote&symbol=${symbol}`);
  const quoteData = await quoteResponse.json();

  const profileResponse = await fetch(`/api/stockdata?endpoint=stock/profile2&symbol=${symbol}`);
  const profileData = await profileResponse.json();

  return {
    symbol: symbol,
    companyName: profileData.name || 'Unknown',
    latestPrice: quoteData.c || 0,
    change: quoteData.d || 0,
    changePercent: quoteData.dp || 0
  };
}

export default function AssetOverview() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        const fetchedAssets = await Promise.all(symbols.map(fetchAssetData));
        setAssets(fetchedAssets);
      } catch (error) {
        setError('Failed to fetch asset data. Please try again later.');
      }
    };

    fetchAllAssets();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-yellow-300 p-4 font-mono">
        <h1 className="text-6xl font-bold mb-8 text-black uppercase">Error</h1>
        <p className="text-2xl text-black">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-300 p-4 font-mono">
      <h1 className="text-6xl font-bold mb-8 text-black uppercase">Top 5 Stocks</h1>
      {selectedAsset ? (
        <AssetDetails asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="bg-white border-4 border-black p-4">
              <h2 className="text-3xl font-bold mb-2">{asset.symbol}</h2>
              <p className="text-xl mb-1">{asset.companyName}</p>
              <p className="text-lg mb-1">Price: ${asset.latestPrice.toFixed(2)}</p>
              <p className={`text-lg mb-2 ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Change: {asset.changePercent.toFixed(2)}%
              </p>
              <button 
                onClick={() => setSelectedAsset(asset)} 
                className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors"
              >
                VIEW DETAILS
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}