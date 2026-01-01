import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { FaExpand, FaCompress } from 'react-icons/fa';

const VideoPlayer = ({ video, onEnd, onError, hasQueue, clientId, activeDeviceId, onBecomeActive }) => {
  const containerRef = useRef(null);
  const [lastVideo, setLastVideo] = useState(null);
  const [player, setPlayer] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if this device is the active one. 
  // If activeDeviceId is null (no one claimed it yet), we treat the first one to load as potential, 
  // but better to default to passive to prevent race conditions, unless user clicks play.
  // However, for smooth UX, if I started the queue, I should probably be active.
  // For now, strict mode: only active if match.
  const isActive = clientId === activeDeviceId;

  useEffect(() => {
    if (video) {
      setLastVideo(video);
    }
  }, [video]);

  // Sync pause state
  useEffect(() => {
    // Wrap in a try-catch to prevent "Cannot read properties of null (reading 'src')"
    // caused by YouTube iframe API internal issues when component unmounts or player state changes rapidly.
    try {
      if (player && typeof player.pauseVideo === 'function' && !isActive) {
         player.pauseVideo();
      }
    } catch (error) {
      console.warn("YouTube Player Error (safe to ignore):", error);
    }
  }, [isActive, player]);

  // Listen for fullscreen changes to update state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const onPlayerReady = (event) => {
    setPlayer(event.target);
    if (!isActive) {
      event.target.pauseVideo();
    }
  };

  const onPlay = () => {
    if (!isActive && onBecomeActive) {
      onBecomeActive();
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: isActive ? 1 : 0, // Only autoplay if we are the active device
      modestbranding: 1,
      rel: 0,
      fs: 0, // Disable native fullscreen button to force use of custom wrapper fullscreen
    },
  };

  // If no current video, but we have items in queue or a last video was playing,
  // keep the last video mounted to prevent full-screen exit during transition.
  const videoToDisplay = video || (hasQueue ? lastVideo : null);

  return (
    <div 
      ref={containerRef}
      className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative ring-1 ring-black/10 group"
    >
      {videoToDisplay ? (
        <>
          <YouTube
            videoId={videoToDisplay.id.videoId}
            opts={opts}
            onEnd={onEnd}
            onError={onError}
            onReady={onPlayerReady}
            onPlay={onPlay}
            className="absolute inset-0 w-full h-full"
            iframeClassName="w-full h-full"
          />
          {/* Custom Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="absolute bottom-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
          </button>
        </>
      ) : (
        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white shadow-inner">
           <div className="text-center p-6">
               <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="text-3xl">🎵</span>
               </div>
               <h2 className="text-xl font-bold mb-2">Ready to Play</h2>
               <p className="text-gray-400">Search and add videos to the queue to start the party!</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
