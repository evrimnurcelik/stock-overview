export default async function handler(req, res) {
  const { endpoint, symbols } = req.query
  const apiKey = process.env.STOCKDATA_API_KEY
  if (!apiKey) {
    console.error('API key not configured')
    return res.status(500).json({ error: 'API key not configured' })
  }

  console.log('API Key:', apiKey ? 'Configured' : 'Not configured')
  console.log('Endpoint:', endpoint)

  const baseUrl = 'https://api.stockdata.org/v1'
  const url = `${baseUrl}/${endpoint}?api_token=${apiKey}&symbols=${symbols}`

  console.log('Requesting URL:', url.replace(apiKey, '[REDACTED]')) // Log the URL for debugging, but hide the API key

  try {
    const response = await fetch(url)
    const responseData = await response.text()
    console.log('Response status:', response.status)
    console.log('Response data:', responseData)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${responseData}`)
    }

    const data = JSON.parse(responseData)
    
    if (data.error) {
      throw new Error(JSON.stringify(data.error))
    }
    
    res.status(200).json(data)
  } catch (error) {
    console.error('Error details:', error)
    res.status(500).json({ error: `Error fetching data from StockData API: ${error.message}` })
  }
}