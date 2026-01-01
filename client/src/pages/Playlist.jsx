import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaTv, FaDesktop, FaHome, FaShareAlt } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import VideoResults from '../components/VideoResults';
import VideoPlayer from '../components/VideoPlayer';
import QueueList from '../components/QueueList';
import { supabase } from '../supabaseClient';

function Playlist() {
  const { id: playlistId } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Initial Fetch & Real-time Subscription
  useEffect(() => {
    if (!playlistId) return;

    fetchState();

    const subscription = supabase
      .channel(`karaoke_queue_${playlistId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'karaoke_queue',
        filter: `playlist_id=eq.${playlistId}`
      }, (payload) => {
        fetchState();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [playlistId]);

  const fetchState = async () => {
    // Fetch currently playing
    const { data: playingData } = await supabase
      .from('karaoke_queue')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('status', 'playing')
      .limit(1)
      .single();

    if (playingData) {
      setCurrentVideo({ ...playingData.video_data, db_id: playingData.id });
    } else {
      setCurrentVideo(null);
    }

    // Fetch queue
    const { data: queueData } = await supabase
      .from('karaoke_queue')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (queueData) {
      setQueue(queueData.map(item => ({ ...item.video_data, db_id: item.id })));
    }
  };

  // Search Videos
  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    try {
      let items = [];
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

      // Direct API call for GitHub Pages / Client-side only mode
      if (apiKey) {
        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: 'snippet',
            maxResults: 20,
            q: query,
            type: 'video',
            videoEmbeddable: 'true',
            key: apiKey
          }
        });
        items = response.data.items;
      } else {
        // Fallback to local backend
        const response = await axios.get(`http://localhost:5000/api/search`, {
          params: { q: query }
        });
        items = response.data.items;
      }

      setSearchResults(items || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add to Queue
  const addToQueue = async (video) => {
    const isDuplicate = queue.some(v => v.id.videoId === video.id.videoId) || 
                        (currentVideo && currentVideo.id.videoId === video.id.videoId);
    
    if (!isDuplicate) {
      const status = currentVideo ? 'waiting' : 'playing';
      
      const { error } = await supabase
        .from('karaoke_queue')
        .insert([
          { 
            playlist_id: playlistId,
            video_id: video.id.videoId, 
            video_data: video, 
            status: status 
          }
        ]);

      if (error) {
        console.error('Error adding to queue:', error);
      }
    }
  };

  const playNext = async () => {
    if (currentVideo && currentVideo.db_id) {
       await supabase
        .from('karaoke_queue')
        .update({ status: 'finished' }) 
        .eq('id', currentVideo.db_id);
    }

    const { data: nextVideos } = await supabase
      .from('karaoke_queue')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('status', 'waiting')
      .order('created_at', { ascending: true })
      .limit(1);

    if (nextVideos && nextVideos.length > 0) {
      await supabase
        .from('karaoke_queue')
        .update({ status: 'playing' })
        .eq('id', nextVideos[0].id);
    }
  };

  const handleVideoEnd = () => {
    playNext();
  };

  const handleRemoveFromQueue = async (index) => {
    const videoToRemove = queue[index];
    if (videoToRemove && videoToRemove.db_id) {
      await supabase
        .from('karaoke_queue')
        .delete()
        .eq('id', videoToRemove.db_id);
    }
  };
  
  const handlePlayNow = async (index) => {
    const videoToPlay = queue[index];
    if (!videoToPlay || !videoToPlay.db_id) return;

    if (currentVideo && currentVideo.db_id) {
        await supabase
          .from('karaoke_queue')
          .update({ status: 'finished' })
          .eq('id', currentVideo.db_id);
    }

    await supabase
      .from('karaoke_queue')
      .update({ status: 'playing' })
      .eq('id', videoToPlay.db_id);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-gray-100 font-sans transition-all duration-300 ${isTvMode ? 'bg-black text-white' : ''}`}>
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className={`p-2 rounded-full ${isTvMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'} shadow-sm`}>
               <FaHome className={isTvMode ? 'text-white' : 'text-gray-600'} />
            </Link>
            <h1 className={`text-3xl font-bold tracking-tight ${isTvMode ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-blue-600">Karaoke</span>Queue
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                copySuccess 
                  ? 'bg-green-500 text-white' 
                  : isTvMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-blue-50'
              } shadow-sm`}
            >
              <FaShareAlt /> {copySuccess ? 'Copied!' : 'Share Link'}
            </button>

            <button 
              onClick={() => setIsTvMode(!isTvMode)}
              className={`p-2 rounded-full transition-colors ${isTvMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-200 shadow-sm'}`}
              title={isTvMode ? "Exit TV Mode" : "Enter TV Mode"}
            >
              {isTvMode ? <FaDesktop /> : <FaTv />}
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <div className={`grid gap-6 ${isTvMode ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-12'}`}>
          
          {/* Left Column: Search & Results */}
          {!isTvMode && (
            <div className="lg:col-span-7 space-y-6">
              <SearchBar onSearch={handleSearch} />
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <VideoResults 
                videos={searchResults} 
                onAddToQueue={addToQueue} 
                loading={loading} 
              />
            </div>
          )}

          {/* Right Column: Player & Queue */}
          <div className={`${isTvMode ? 'lg:col-span-3' : 'lg:col-span-5'} space-y-6 flex flex-col`}>
            {/* Player Section */}
            <div className="sticky top-6 z-10">
               <VideoPlayer 
                 video={currentVideo} 
                 onEnd={handleVideoEnd}
                 onError={() => console.error("Video Error")}
                 hasQueue={queue.length > 0}
               />
               
               {/* Queue Section */}
               <div className="mt-6">
                 <QueueList 
                   queue={queue} 
                   currentVideo={currentVideo}
                   onRemove={handleRemoveFromQueue}
                   onPlayNow={handlePlayNow}
                 />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Playlist;
