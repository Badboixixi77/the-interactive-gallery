import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GalleryPage from './pages/GalleryPage';
import ImageDetailPage from './pages/ImageDetailPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<GalleryPage />} />
      <Route path="/image/:id" element={<ImageDetailPage />} />
    </Routes>
  );
}

export default App;
