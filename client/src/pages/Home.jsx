import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { FaMusic } from 'react-icons/fa';
import Toast from '../components/Toast';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const createPlaylist = async () => {
    setLoading(true);
    try {
      const data = await api.createPlaylist();
      
      if (data && data.id) {
        navigate(`/playlist/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      setToast({ message: 'Failed to create playlist. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black flex items-center justify-center text-white px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <FaMusic className="text-6xl text-blue-400 animate-bounce" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">
          Grey<span className="text-blue-400">Karaoke</span>
        </h1>
        <p className="text-gray-300 text-lg">
          Create a collaborative playlist, share the link, and sing your heart out!
        </p>
        
        <button
          onClick={createPlaylist}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? 'Creating...' : 'Create New Playlist'}
        </button>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Home;
