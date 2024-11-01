
export default async function handler(req, res) {
  const { endpoint, symbol } = req.query
  const apiKey = process.env.STOCKDATA_API_KEY
  if (!apiKey) {
    console.error('API key not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  const baseUrl = 'https://api.stockdata.org/v1'
  let url

  if (endpoint === 'market/rankings') {
    // Use the /v1/data/quote endpoint to fetch data for multiple symbols
    const symbols = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'FB', 'TSLA', 'BRK.A', 'V', 'JNJ', 'WMT'].join(',')
    url = `${baseUrl}/data/quote?symbols=${symbols}&api_token=${apiKey}`
  } else if (endpoint === 'data/intraday/adjusted') {
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required for intraday data' })
    }
    url = `${baseUrl}/data/intraday?symbols=${symbol}&api_token=${apiKey}`
  } else {
    return res.status(400).json({ error: 'Invalid endpoint' })
  }

  console.log('Requesting URL:', url) // Log the URL for debugging

  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('API Response:', JSON.stringify(data, null, 2))
      throw new Error(JSON.stringify(data.error || `HTTP error! status: ${response.status}`))
    }
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching data from StockData API:', error)
    res.status(500).json({ error: `Error fetching data from StockData API: ${error.message}` })
  }
}