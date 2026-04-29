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

// GET captcha - generates a new captchaIdentifier + returns image
app.get('/captcha', async (req, res) => {
  try {
    // First get a session
    const session = await axios.get('https://iporesult.cdsc.com.np/', { headers: HEADERS });
    const cookies = session.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';

    // Generate a UUID for captchaIdentifier
    const captchaIdentifier = crypto.randomUUID();

    // Load captcha image
    const response = await axios.post(
      `https://iporesult.cdsc.com.np/result/captcha/reload/${captchaIdentifier}`,
      {},
      { headers: { ...HEADERS, 'Cookie': cookies } }
    );

    // Save cookies tied to this captchaIdentifier
    const newCookies = response.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || cookies;
    sessions[captchaIdentifier] = newCookies;

    res.json({
      captchaIdentifier,
      captchaImage: response.data // base64 image string
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST check
app.post('/check', async (req, res) => {
  try {
    const { companyShareId, boid, captchaIdentifier, userCaptcha } = req.body;

    const cookies = sessions[captchaIdentifier] || '';

    const response = await axios.post(
      'https://iporesult.cdsc.com.np/result/result/check',
      { companyShareId: String(companyShareId), boid, captchaIdentifier, userCaptcha },
      { headers: { ...HEADERS, 'Content-Type': 'application/json', 'Cookie': cookies } }
    );

    // Clean up session
    delete sessions[captchaIdentifier];

    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}); 
// app.post('/check', async (req, res) => {
//   try {
//     const { companyShareId, boid } = req.body;

//     // Step 1: Get cookies by visiting the page first
//     const session = await axios.get(
//       'https://iporesult.cdsc.com.np/',
//       { headers: HEADERS }
//     );
//     const cookies = session.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';

//     // Step 2: Use those cookies in the POST
//     const response = await axios.post(
//       'https://iporesult.cdsc.com.np/result/result/check',
//       { companyShareId: String(companyShareId), boid },
//       { 
//         headers: { 
//           ...HEADERS, 
//           'Content-Type': 'application/json',
//           'Cookie': cookies
//         } 
//       }
//     );
//     res.json(response.data);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

app.listen(process.env.PORT || 3000, () => console.log('Proxy running on port 3000'));