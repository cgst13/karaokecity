import React from 'react';
import { FaPlus } from 'react-icons/fa';

const VideoCard = ({ video, onAddToQueue }) => {
  const { id, snippet } = video;
  const { title, channelTitle, thumbnails } = snippet;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="relative pb-[56.25%] bg-gray-200 group">
        <img
          src={thumbnails.medium.url}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-800" title={title}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{channelTitle}</p>
        </div>
        <button
          onClick={() => onAddToQueue(video)}
          className="w-full mt-2 py-2 px-3 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors"
        >
          <FaPlus size={10} /> Add to Queue
        </button>
      </div>
    </div>
  );
};

export default VideoCard;
