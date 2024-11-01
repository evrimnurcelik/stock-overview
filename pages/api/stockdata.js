export default async function handler(req, res) {
  const { endpoint } = req.query
  const apiKey = process.env.STOCKDATA_API_KEY
  if (!apiKey) {
    console.error('API key not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  console.log('API Key:', apiKey ? 'Configured' : 'Not configured')
  console.log('Endpoint:', endpoint)

  const baseUrl = 'https://api.stockdata.org/v1'
  
  // Construct the URL based on the endpoint
  let url
  if (endpoint.includes('?')) {
    url = `${baseUrl}/${endpoint}&api_token=${apiKey}`
  } else {
    url = `${baseUrl}/${endpoint}?api_token=${apiKey}`
  }

  console.log('Requesting URL:', url.replace(apiKey, '[REDACTED]')) // Log the URL for debugging, but hide the API key

  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
    }
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error details:', error)
    res.status(500).json({ error: `Error fetching data from StockData API: ${error.message}` })
  }
}