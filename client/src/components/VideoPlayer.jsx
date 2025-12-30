import React, { useRef, useEffect } from 'react';
import YouTube from 'react-youtube';

const VideoPlayer = ({ video, onEnd, onError }) => {
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  if (!video) {
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
        videoId={video.id.videoId}
        opts={opts}
        onEnd={onEnd}
        onError={onError}
        className="absolute inset-0 w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
};

export default VideoPlayer;
