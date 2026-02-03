import React from 'react';
import { FaPlus } from 'react-icons/fa';

const VideoCard = ({ video, onAddToQueue, viewMode = 'grid' }) => {
  const { id, snippet } = video;
  const { title, channelTitle, thumbnails } = snippet;

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-row h-[50px] sm:h-24 cursor-pointer group/card"
        onClick={() => onAddToQueue(video)}
      >
        <div className="relative h-full aspect-video bg-gray-200 group flex-shrink-0">
          <img
            src={thumbnails.medium.url}
            alt={title}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <FaPlus className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={12} />
          </div>
        </div>
        <div className="p-1.5 sm:p-3 flex-grow flex flex-col justify-center min-w-0">
          <h3 className="font-semibold text-[10px] sm:text-sm line-clamp-1 sm:line-clamp-2 mb-0 sm:mb-1 text-gray-800 group-hover/card:text-blue-600 transition-colors leading-snug" title={title}>
            {title}
          </h3>
          <p className="text-[9px] sm:text-xs text-gray-500 truncate">{channelTitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full cursor-pointer group/card"
      onClick={() => onAddToQueue(video)}
    >
      <div className="relative pb-[56.25%] bg-gray-200 group">
        <img
          src={thumbnails.medium.url}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <FaPlus className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={20} />
        </div>
      </div>
      <div className="p-1.5 sm:p-2 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-[11px] sm:text-xs line-clamp-2 mb-0.5 text-gray-800 group-hover/card:text-blue-600 transition-colors leading-snug" title={title}>
            {title}
          </h3>
          <p className="text-[9px] sm:text-[10px] text-gray-500 mb-0 truncate">{channelTitle}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
