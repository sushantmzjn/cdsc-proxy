const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://iporesult.cdsc.com.np/',
  'Origin': 'https://iporesult.cdsc.com.np',
};

app.get('/companies', async (req, res) => {
  try {
    const response = await axios.get(
      'https://iporesult.cdsc.com.np/result/companyShares/fileUploaded',
      { headers: HEADERS }
    );
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/check', async (req, res) => {
  try {
    const { companyShareId, boid } = req.body;
    const response = await axios.post(
      'https://iporesult.cdsc.com.np/result/result/check',
      { companyShareId: String(companyShareId), boid },
      { headers: { ...HEADERS, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running on port 3000'));