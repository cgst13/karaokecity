import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import sheetService from './services/sheetClient.js';

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
        videoEmbeddable: 'true',
        key: API_KEY,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from YouTube API:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from YouTube API' });
  }
});

// Playlist Endpoints

// Create a new playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const playlist = await sheetService.createPlaylist();
    res.json(playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Get playlist by ID
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlist = await sheetService.getPlaylist(req.params.id);
    if (playlist) {
      res.json(playlist);
    } else {
      res.status(404).json({ error: 'Playlist not found' });
    }
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// Update active device
app.put('/api/playlists/:id', async (req, res) => {
  try {
    const { active_device_id } = req.body;
    await sheetService.updatePlaylistDevice(req.params.id, active_device_id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Queue Endpoints

// Get queue for a playlist
app.get('/api/queue/:playlistId', async (req, res) => {
  try {
    const queue = await sheetService.getQueue(req.params.playlistId);
    res.json(queue);
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Add item to queue
app.post('/api/queue', async (req, res) => {
  try {
    const item = req.body;
    await sheetService.addToQueue(item);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding to queue:', error);
    res.status(500).json({ error: 'Failed to add to queue' });
  }
});

// Update queue item status
app.put('/api/queue/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await sheetService.updateQueueStatus(req.params.id, status);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating queue item:', error);
    res.status(500).json({ error: 'Failed to update queue item' });
  }
});

// Swap queue items
app.post('/api/queue/swap', async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    if (!id1 || !id2) {
      return res.status(400).json({ error: 'Missing id1 or id2' });
    }
    await sheetService.swapQueueItems(id1, id2);
    res.json({ success: true });
  } catch (error) {
    console.error('Error swapping queue items:', error);
    res.status(500).json({ error: 'Failed to swap queue items' });
  }
});

// Remove item from queue
app.delete('/api/queue/:id', async (req, res) => {
  try {
    await sheetService.removeFromQueue(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from queue:', error);
    res.status(500).json({ error: 'Failed to remove from queue' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
