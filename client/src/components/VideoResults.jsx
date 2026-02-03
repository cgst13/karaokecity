import React from 'react';
import VideoCard from './VideoCard';

const VideoResults = ({ videos, onAddToQueue, loading, viewMode = 'grid' }) => {
  if (loading) {
    if (viewMode === 'list') {
      return (
        <div className="flex flex-col gap-1 sm:gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-[50px] sm:h-24 animate-pulse shadow-sm border border-gray-100 flex p-2 gap-3">
              <div className="h-full aspect-video bg-gray-200 rounded"></div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-2 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg aspect-[4/3] animate-pulse shadow-sm border border-gray-100 overflow-hidden">
             <div className="h-full w-full bg-gray-200"></div>
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

  const gridClasses = "grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-1 sm:gap-2";
  const listClasses = "flex flex-col gap-1 sm:gap-2";

  return (
    <div className={viewMode === 'list' ? listClasses : gridClasses}>
      {videos.map((video) => (
        <VideoCard
          key={video.id.videoId}
          video={video}
          onAddToQueue={onAddToQueue}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
};

export default VideoResults;
