import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Playlist from './pages/Playlist';

function App() {
  // Determine basename: if running on GitHub Pages subdirectory, use repo name; otherwise root.
  // This supports both 'cgst13.github.io/karaokecity' and 'custom-domain.com'
  const basename = window.location.pathname.startsWith('/karaokecity') 
    ? '/karaokecity' 
    : window.location.pathname.startsWith('/greykaraoke')
      ? '/greykaraoke'
      : '/';

  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/playlist/:id" element={<Playlist />} />
      </Routes>
    </Router>
  );
}

export default App;
