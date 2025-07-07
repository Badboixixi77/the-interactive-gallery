import React from 'react';
import { Link } from 'react-router-dom';

interface ImageCardProps {
  image: any;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Link to={`/image/${image.id}`}>
        <img
          src={image.urls.small}
          alt={image.alt_description}
          style={{ width: '100%', borderRadius: 8, display: 'block' }}
        />
      </Link>
    </div>
  );
};

export default ImageCard; 