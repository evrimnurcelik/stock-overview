import fetch from 'node-fetch'

export default async function handler(req, res) {
  const { endpoint } = req.query
  const apiKey = process.env.STOCKDATA_API_KEY
  if (!apiKey) {
    console.error('API key not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  const baseUrl = 'https://api.stockdata.org/v1'
  const url = `${baseUrl}/${endpoint}&api_token=${apiKey}`

  console.log('Requesting URL:', url) // Log the URL for debugging

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching data from StockData API:', error)
    res.status(500).json({ error: `Error fetching data from StockData API: ${error.message}` })
  }
}