import React from 'react';
import Masonry from 'react-masonry-css';
import ImageCard from './ImageCard';

interface GalleryProps {
  images: any[];
}

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {images.map((img) => (
        <ImageCard key={img.id} image={img} />
      ))}
    </Masonry>
  );
};

export default Gallery; 