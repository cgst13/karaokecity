const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Playlist
  createPlaylist: async () => {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
    });
    return response.json();
  },

  getPlaylist: async (id) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`);
    if (!response.ok) throw new Error('Playlist not found');
    return response.json();
  },

  updatePlaylistDevice: async (id, activeDeviceId) => {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_device_id: activeDeviceId }),
    });
    return response.json();
  },

  // Queue
  getQueue: async (playlistId) => {
    const response = await fetch(`${API_BASE_URL}/queue/${playlistId}`);
    return response.json();
  },

  addToQueue: async (item) => {
    const response = await fetch(`${API_BASE_URL}/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    return response.json();
  },

  updateQueueStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/queue/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },

  swapQueueItems: async (id1, id2) => {
    const response = await fetch(`${API_BASE_URL}/queue/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id1, id2 }),
    });
    return response.json();
  },

  removeFromQueue: async (id) => {
    const response = await fetch(`${API_BASE_URL}/queue/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
