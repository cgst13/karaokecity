const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Proxy endpoint for YouTube Search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'YouTube API Key is missing on server.' });
  }

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 20,
        q: q,
        type: 'video',
        key: API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from YouTube API:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
