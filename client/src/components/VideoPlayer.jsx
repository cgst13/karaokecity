import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ video, onEnd, onError, hasQueue, clientId, activeDeviceId, onBecomeActive }) => {
  const [lastVideo, setLastVideo] = useState(null);
  const [player, setPlayer] = useState(null);

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
    if (player && !isActive) {
       // If we are not active, ensure we are paused
       // But we only want to enforce this if the video is actually playing?
       // Actually, calling pauseVideo() is safe even if already paused.
       player.pauseVideo();
    }
  }, [isActive, player]);

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
    },
  };

  // If no current video, but we have items in queue or a last video was playing,
  // keep the last video mounted to prevent full-screen exit during transition.
  const videoToDisplay = video || (hasQueue ? lastVideo : null);

  if (!videoToDisplay) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-inner">
        <div className="text-center p-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎵</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready to Play</h2>
            <p className="text-gray-400">Search and add videos to the queue to start the party!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg relative ring-1 ring-black/10">
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
    </div>
  );
};

export default VideoPlayer;
