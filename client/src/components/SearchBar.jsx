import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-6">
      <div className="relative flex items-center shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for YouTube videos..."
          className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-lg hover:bg-blue-700 transition-colors flex items-center justify-center border border-blue-600"
        >
          <FaSearch className="mr-2" /> Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
