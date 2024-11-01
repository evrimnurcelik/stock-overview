import fetch from 'node-fetch'

export default async function handler(req, res) {
  const { endpoint } = req.query
  const apiKey = process.env.STOCKDATA_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const baseUrl = 'https://api.stockdata.org/v1'
  const url = `${baseUrl}/${endpoint}?api_token=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from StockData API' })
  }
}