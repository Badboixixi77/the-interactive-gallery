import React from 'react';
import { Link } from 'react-router-dom';

interface ImageCardProps {
  image: any;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="image-card">
      <Link to={`/image/${image.id}`}>
        <img
          src={image.urls.small}
          alt={image.alt_description || 'Gallery image'}
        />
        <div className="image-card-overlay">
          {image.user?.name || 'Unknown photographer'}
        </div>
      </Link>
    </div>
  );
};

export default ImageCard;
