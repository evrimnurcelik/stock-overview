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
    <Card className="bg-white border-4 border-black p-8">
      <CardHeader>
        <CardTitle className="text-4xl font-bold text-red-600">{asset.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl mb-4">{asset.name}</p>
        <p className="text-xl">Current Price: ${asset.price?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl">Day High: ${asset.day_high?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl">Day Low: ${asset.day_low?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl">Day Open: ${asset.day_open?.toFixed(2) ?? 'N/A'}</p>
        <p className="text-xl">Previous Close: ${asset.previous_close_price?.toFixed(2) ?? 'N/A'}</p>
        
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