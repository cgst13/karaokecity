import React from 'react';
import VideoCard from './VideoCard';

const VideoResults = ({ videos, onAddToQueue, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg h-64 animate-pulse shadow-sm border border-gray-100 p-4">
             <div className="h-32 bg-gray-200 rounded mb-4"></div>
             <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
             <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
        <p>No videos found. Try searching above!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id.videoId}
          video={video}
          onAddToQueue={onAddToQueue}
        />
      ))}
    </div>
  );
};

export default VideoResults;
