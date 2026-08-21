import React from 'react';
import type { SearchFilters } from '../services/unsplashService';

interface FilterBarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  totalResults?: number;
  showFilters: boolean;
}

const ORIENTATIONS = [
  { value: '', label: 'All' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'squarish', label: 'Square' },
];

const COLORS = [
  { value: '', label: 'All', hex: null },
  { value: 'black_and_white', label: 'B&W', hex: '#808080' },
  { value: 'black', label: '', hex: '#000000' },
  { value: 'white', label: '', hex: '#ffffff' },
  { value: 'yellow', label: '', hex: '#FFD700' },
  { value: 'orange', label: '', hex: '#FF8C00' },
  { value: 'red', label: '', hex: '#DC143C' },
  { value: 'purple', label: '', hex: '#800080' },
  { value: 'magenta', label: '', hex: '#FF00FF' },
  { value: 'green', label: '', hex: '#228B22' },
  { value: 'teal', label: '', hex: '#008080' },
  { value: 'blue', label: '', hex: '#0000CD' },
];

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Relevant' },
  { value: 'latest', label: 'Latest' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalResults,
  showFilters,
}) => {
  if (!showFilters) return null;

  return (
    <div className="filter-bar fade-in">
      <div className="filter-bar-top">
        {/* Result count */}
        {totalResults !== undefined && totalResults > 0 && (
          <span className="filter-results">
            {totalResults.toLocaleString()} results
          </span>
        )}

        {/* Sort */}
        <div className="filter-group">
          <span className="filter-label">Sort</span>
          <div className="filter-options">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`filter-chip ${filters.order_by === opt.value ? 'filter-chip-active' : ''}`}
                onClick={() => onFilterChange({ ...filters, order_by: opt.value as any })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orientation */}
        <div className="filter-group">
          <span className="filter-label">Orientation</span>
          <div className="filter-options">
            {ORIENTATIONS.map(opt => (
              <button
                key={opt.value}
                className={`filter-chip ${filters.orientation === (opt.value || undefined) ? 'filter-chip-active' : ''}`}
                onClick={() => onFilterChange({ ...filters, orientation: (opt.value || undefined) as any })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color filter */}
      <div className="filter-bar-bottom">
        <div className="filter-group">
          <span className="filter-label">Color</span>
          <div className="filter-color-options">
            {COLORS.map(opt => (
              <button
                key={opt.value}
                className={`filter-color-swatch ${filters.color === (opt.value || undefined) ? 'filter-color-active' : ''}`}
                style={opt.hex ? { background: opt.hex } : {}}
                onClick={() => onFilterChange({ ...filters, color: opt.value || undefined })}
                title={opt.label || opt.value}
              >
                {!opt.hex && <span>{opt.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Clear filters */}
        {(filters.orientation || filters.color || filters.order_by) && (
          <button
            className="filter-clear-btn"
            onClick={() => onFilterChange({})}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
