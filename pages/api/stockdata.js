export default async function handler(req, res) {
  const { endpoint, symbol } = req.query;
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.error('API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const baseUrl = 'https://finnhub.io/api/v1';
  const url = `${baseUrl}/${endpoint}?symbol=${symbol}&token=${apiKey}`;

  console.log('Requesting URL:', url.replace(apiKey, '[REDACTED]')); // Log the URL for debugging, but hide the API key

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.status === 403) {
      console.error('API access denied. Please check your API key and account permissions.');
      return res.status(403).json({ error: 'API access denied. Please check your API key and account permissions.' });
    }

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ error: `Error fetching data from Finnhub API: ${error.message}` });
  }
}