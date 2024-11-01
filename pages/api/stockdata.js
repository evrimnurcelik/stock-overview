import yf from 'yfinance'

export default async function handler(req, res) {
  const { endpoint } = req.query

  try {
    if (endpoint === 'top50') {
      // Fetch top 50 stocks by market cap
      const topStocks = await yf.getTopMarketCap(50)
      
      // Fetch details for each stock
      const stockDetails = await Promise.all(
        topStocks.map(async (symbol) => {
          try {
            const quote = await yf.quote(symbol)
            return {
              symbol,
              name: quote.longName || quote.shortName || 'Unknown',
              price: quote.regularMarketPrice || 0,
              marketCap: quote.marketCap || 0,
              dayHigh: quote.dayHigh || 0,
              dayLow: quote.dayLow || 0,
            }
          } catch (error) {
            console.error(`Error fetching details for ${symbol}:`, error)
            return null
          }
        })
      )

      // Filter out any null results (failed fetches)
      const validStockDetails = stockDetails.filter(stock => stock !== null)

      res.status(200).json(validStockDetails)
    } else if (endpoint === 'details') {
      const { symbol } = req.query
      if (!symbol) {
        res.status(400).json({ error: 'Symbol is required' })
        return
      }
      const quote = await yf.quote(symbol)
      const history = await yf.historical(symbol, { period: '1mo' })
      res.status(200).json({ quote, history })
    } else {
      res.status(400).json({ error: 'Invalid endpoint' })
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Error fetching data', details: error.message })
  }
}