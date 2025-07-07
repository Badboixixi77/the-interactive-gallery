import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GalleryPage from './pages/GalleryPage';
import ImageDetailPage from './pages/ImageDetailPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/image/:id" element={<ImageDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
