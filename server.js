const express = require('express');
const app = express();

app.get('/companies', (req, res) => {
  res.json({ status: 'route works' });
});

app.listen(process.env.PORT || 3000, () => console.log('running'));