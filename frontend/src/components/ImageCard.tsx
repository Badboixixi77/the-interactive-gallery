import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

interface ImageCardProps {
  image: any;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(image.id);

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(image.id);
  };

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
      <button
        className={`heart-btn ${fav ? 'heart-active' : ''}`}
        onClick={handleHeart}
        aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
        title={fav ? 'Remove from favorites' : 'Add to favorites'}
      >
        {fav ? '\u2665' : '\u2661'}
      </button>
    </div>
  );
};

export default ImageCard;
