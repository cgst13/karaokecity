import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { FaTv, FaDesktop, FaHome, FaShareAlt, FaThLarge, FaList } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';
import VideoResults from '../components/VideoResults';
import VideoPlayer from '../components/VideoPlayer';
import QueueList from '../components/QueueList';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import { api } from '../api/client';

function Playlist() {
  const { id: playlistId } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTvMode, setIsTvMode] = useState(false);
  const [error, setError] = useState(null);
  
  // Toast State
  const [toast, setToast] = useState(null); // { message, type }

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger',
    confirmText: 'Confirm'
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Client ID for exclusive playback
  const [clientId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  // Initial Fetch & Polling
  useEffect(() => {
    if (!playlistId) return;

    fetchState();

    const intervalId = setInterval(fetchState, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [playlistId]);

  const fetchState = async () => {
    try {
      // Fetch playlist meta for active device
      const playlistData = await api.getPlaylist(playlistId);
      
      if (playlistData) {
        setActiveDeviceId(playlistData.active_device_id);
      }

      // Fetch queue
      const queueData = await api.getQueue(playlistId);
      
      // Process queue data
      const playing = queueData.find(item => item.status === 'playing');
      const waiting = queueData
        .filter(item => item.status === 'waiting')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      if (playing) {
        setCurrentVideo({ ...playing.video_data, db_id: playing.id });
      } else {
        setCurrentVideo(null);
      }

      if (waiting) {
        setQueue(waiting.map(item => ({ ...item.video_data, db_id: item.id })));
      }
    } catch (err) {
      console.error('Error fetching state:', err);
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
      
      try {
        await api.addToQueue({
          playlist_id: playlistId,
          video_id: video.id.videoId,
          video_data: video,
          status: status
        });
        
        // Refresh immediately
        fetchState();
        setToast({ message: `Added to queue: ${video.snippet.title}`, type: 'success' });
      } catch (error) {
        console.error('Error adding to queue:', error);
        setToast({ message: 'Failed to add to queue', type: 'error' });
      }
    } else {
       setToast({ message: `Already in queue: ${video.snippet.title}`, type: 'error' });
    }
  };

  const playNext = async () => {
    try {
      if (currentVideo && currentVideo.db_id) {
         await api.updateQueueStatus(currentVideo.db_id, 'finished');
      }

      // Fetch latest queue to get next video
      const queueData = await api.getQueue(playlistId);
      const nextVideos = queueData
        .filter(item => item.status === 'waiting')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      if (nextVideos && nextVideos.length > 0) {
        await api.updateQueueStatus(nextVideos[0].id, 'playing');
      }
      
      // Refresh immediately
      fetchState();
    } catch (err) {
      console.error('Error playing next:', err);
    }
  };

  const handleVideoEnd = () => {
    playNext();
  };

  const handleRemoveFromQueue = (index) => {
    const videoToRemove = queue[index];
    if (videoToRemove && videoToRemove.db_id) {
      setConfirmModal({
        isOpen: true,
        title: 'Remove from Queue',
        message: `Are you sure you want to remove "${videoToRemove.snippet.title}" from the queue?`,
        type: 'danger',
        confirmText: 'Remove',
        onConfirm: async () => {
          try {
            await api.removeFromQueue(videoToRemove.db_id);
            fetchState();
            setToast({ message: `Removed from queue: ${videoToRemove.snippet.title}`, type: 'success' });
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
          } catch (err) {
            console.error('Error removing from queue:', err);
            setToast({ message: 'Failed to remove from queue', type: 'error' });
          }
        }
      });
    }
  };
  
  const handlePlayNow = (index) => {
    const videoToPlay = queue[index];
    if (!videoToPlay || !videoToPlay.db_id) return;

    setConfirmModal({
      isOpen: true,
      title: 'Play Now',
      message: `Are you sure you want to play "${videoToPlay.snippet.title}" now?`,
      type: 'info',
      confirmText: 'Play Now',
      onConfirm: async () => {
        try {
          if (currentVideo && currentVideo.db_id) {
              await api.updateQueueStatus(currentVideo.db_id, 'finished');
          }

          await api.updateQueueStatus(videoToPlay.db_id, 'playing');
          fetchState();
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error('Error playing now:', err);
          setToast({ message: 'Failed to play video', type: 'error' });
        }
      }
    });
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const itemToMove = queue[index];
    const itemAbove = queue[index - 1];
    
    // Optimistic update
    const newQueue = [...queue];
    newQueue[index] = itemAbove;
    newQueue[index - 1] = itemToMove;
    setQueue(newQueue);

    try {
      await api.swapQueueItems(itemToMove.db_id, itemAbove.db_id);
      fetchState();
    } catch (err) {
      console.error('Error moving item up:', err);
      fetchState(); // Revert on error
    }
  };

  const handleMoveDown = async (index) => {
    if (index === queue.length - 1) return;
    const itemToMove = queue[index];
    const itemBelow = queue[index + 1];

    // Optimistic update
    const newQueue = [...queue];
    newQueue[index] = itemBelow;
    newQueue[index + 1] = itemToMove;
    setQueue(newQueue);

    try {
      await api.swapQueueItems(itemToMove.db_id, itemBelow.db_id);
      fetchState();
    } catch (err) {
      console.error('Error moving item down:', err);
      fetchState(); // Revert on error
    }
  };

  const handleBecomeActiveDevice = async () => {
    if (!playlistId || !clientId) return;

    try {
      await api.updatePlaylistDevice(playlistId, clientId);
      
      // Optimistically update local state
      setActiveDeviceId(clientId);
    } catch (err) {
      console.error('Error setting active device:', err);
    }
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
              <span className="text-blue-600">Grey</span>Karaoke
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
              
              {/* Mobile Queue (Minimal) */}
              <div className="lg:hidden">
                <QueueList 
                  queue={queue} 
                  currentVideo={currentVideo}
                  onRemove={handleRemoveFromQueue}
                  onPlayNow={handlePlayNow}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  minimal={true}
                />
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-grow">
                  <SearchBar onSearch={handleSearch} />
                </div>
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Grid View"
                  >
                    <FaThLarge size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="List View"
                  >
                    <FaList size={18} />
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <VideoResults 
                videos={searchResults} 
                onAddToQueue={addToQueue} 
                loading={loading} 
                viewMode={viewMode}
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
                 clientId={clientId}
                 activeDeviceId={activeDeviceId}
                 onBecomeActive={handleBecomeActiveDevice}
               />
               
               {/* Queue Section */}
               <div className="mt-6 hidden lg:block">
                 <QueueList 
                   queue={queue} 
                   currentVideo={currentVideo}
                   onRemove={handleRemoveFromQueue}
                   onPlayNow={handlePlayNow}
                   onMoveUp={handleMoveUp}
                   onMoveDown={handleMoveDown}
                 />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Components */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
      />
      
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

export default Playlist;
