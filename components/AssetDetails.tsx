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
    <Card className="bg-white border-4 border-black p-8 mb-8">
      <CardHeader className="border-b-4 border-black mb-4">
        <CardTitle className="text-5xl font-bold text-red-600">{asset.symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold mb-6">{asset.name}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <p className="text-xl">Current Price: <span className="font-bold">${asset.price?.toFixed(2) ?? 'N/A'}</span></p>
          <p className="text-xl">Day High: <span className="font-bold">${asset.day_high?.toFixed(2) ?? 'N/A'}</span></p>
          <p className="text-xl">Day Low: <span className="font-bold">${asset.day_low?.toFixed(2) ?? 'N/A'}</span></p>
          <p className="text-xl">Day Open: <span className="font-bold">${asset.day_open?.toFixed(2) ?? 'N/A'}</span></p>
          <p className="text-xl">Previous Close: <span className="font-bold">${asset.previous_close_price?.toFixed(2) ?? 'N/A'}</span></p>
        </div>
        <Button 
          onClick={onBack} 
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 border-b-4 border-gray-900 hover:border-gray-700 rounded-none text-lg uppercase"
        >
          Back to List
        </Button>
      </CardContent>
    </Card>
  )
}