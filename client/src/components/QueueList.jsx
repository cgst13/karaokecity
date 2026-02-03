import React from 'react';
import { FaTrash, FaPlay, FaGripVertical, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const QueueList = ({ queue, currentVideo, onRemove, onPlayNow, onMoveUp, onMoveDown, minimal = false }) => {
  if (queue.length === 0 && !currentVideo) {
    if (minimal) return null;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Queue is empty. Add some videos!</p>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-sm text-gray-800">Queue ({queue.length})</h2>
          {currentVideo && (
            <span className="text-xs text-blue-600 font-medium truncate max-w-[200px]">
              Now: {currentVideo.snippet.title}
            </span>
          )}
        </div>
        
        <div className="max-h-[150px] overflow-y-auto p-2 space-y-1">
          {queue.map((video, index) => (
            <div 
              key={`${video.id.videoId}-${index}`}
              className="flex items-center justify-between gap-2 p-1.5 hover:bg-gray-50 rounded text-sm group"
            >
              <div 
                className="flex-1 truncate cursor-pointer text-gray-700 hover:text-blue-600"
                onClick={() => onPlayNow(index)}
              >
                <span className="font-medium text-xs mr-2 text-gray-400">{index + 1}.</span>
                {video.snippet.title}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className={`text-gray-400 p-1 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-500'}`}
                >
                  <FaArrowUp size={10} />
                </button>
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === queue.length - 1}
                  className={`text-gray-400 p-1 ${index === queue.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-500'}`}
                >
                  <FaArrowDown size={10} />
                </button>
                <button
                  onClick={() => onRemove(index)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-100px)]">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-800 flex items-center justify-between">
          <span>Up Next</span>
          <span className="text-sm font-normal text-gray-500 bg-white px-2 py-1 rounded border">{queue.length} videos</span>
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {currentVideo && (
           <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
             <div className="relative w-24 flex-shrink-0 aspect-video rounded overflow-hidden shadow-sm">
               <img 
                 src={currentVideo.snippet.thumbnails.default.url} 
                 alt={currentVideo.snippet.title}
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                 <FaPlay className="text-white text-xs" />
               </div>
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">Now Playing</p>
               <h4 className="text-sm font-semibold text-gray-800 truncate" title={currentVideo.snippet.title}>
                 {currentVideo.snippet.title}
               </h4>
               <p className="text-xs text-gray-500 truncate">{currentVideo.snippet.channelTitle}</p>
             </div>
           </div>
        )}

        {queue.map((video, index) => (
          <div 
            key={`${video.id.videoId}-${index}`}
            className="group flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="flex flex-col gap-1">
               <button
                  onClick={() => onMoveUp(index)}
                  disabled={index === 0}
                  className={`text-gray-300 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-500 cursor-pointer'}`}
                >
                  <FaArrowUp size={10} />
                </button>
                <button
                  onClick={() => onMoveDown(index)}
                  disabled={index === queue.length - 1}
                  className={`text-gray-300 ${index === queue.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-blue-500 cursor-pointer'}`}
                >
                  <FaArrowDown size={10} />
                </button>
            </div>
            <div className="w-24 flex-shrink-0 aspect-video rounded overflow-hidden relative cursor-pointer group/thumb" onClick={() => onPlayNow(index)}>
               <img 
                 src={video.snippet.thumbnails.default.url} 
                 alt={video.snippet.title}
                 className="w-full h-full object-cover"
               />
                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 flex items-center justify-center transition-colors">
                 <FaPlay className="text-white opacity-0 group-hover/thumb:opacity-100 drop-shadow-md" size={12} />
               </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-700 truncate" title={video.snippet.title}>
                {video.snippet.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">{video.snippet.channelTitle}</p>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Remove from queue"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueueList;
