import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

interface Asset {
  symbol: string
  name: string
  price: number
  day_high: number
  day_low: number
  day_open: number
  previous_close_price: number
}

interface AssetDetailsProps {
  asset: Asset
  onBack: () => void
}

export default function AssetDetails({ asset, onBack }: AssetDetailsProps) {
  return (
    <div className="bg-white border-4 border-black p-4">
      <h2 className="text-4xl font-bold mb-4 text-black uppercase">{asset.symbol}</h2>
      <div className="mb-4">
        <p className="text-2xl mb-2">{asset.name}</p>
        <p className="text-xl mb-1">Price: ${asset.price?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl mb-1">Day High: ${asset.day_high?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl mb-1">Day Low: ${asset.day_low?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl mb-1">Day Open: ${asset.day_open?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl mb-1">Previous Close: ${asset.previous_close_price?.toFixed(2) ?? 'N/A'}</p>
      </div>
      
      <Button 
        onClick={onBack} 
        className="w-full bg-black text-white font-bold py-2 px-4 border-2 border-white hover:bg-white hover:text-black hover:border-black transition-colors"
      >
        BACK TO OVERVIEW
      </Button>
    </div>
  )
}