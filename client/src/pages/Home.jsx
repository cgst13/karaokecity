import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaMusic } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const createPlaylist = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .insert([{}]) // default values
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        navigate(`/playlist/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
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
          Karaoke<span className="text-blue-400">Queue</span>
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
    </div>
  );
}

export default Home;
