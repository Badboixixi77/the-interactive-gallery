import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GalleryPage from './pages/GalleryPage';
import ImageDetailPage from './pages/ImageDetailPage';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content fade-in">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/image/:id" element={<ImageDetailPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
