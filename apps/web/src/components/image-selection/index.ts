// Export all image selection components
export { default as ImageGallery } from './ImageGallery';
export { default as ImageGrid } from './ImageGrid';
export { default as ImageCard } from './ImageCard';
export { default as CategoryFilter } from './CategoryFilter';
export { default as SearchBar } from './SearchBar';
export { default as SelectionPanel } from './SelectionPanel';
export { default as ImageModal } from './ImageModal';
export { default as UploadZone } from './UploadZone';

// Export types
export type {
  ItemImage,
  ImageSelection,
  CategoryInfo,
  ImageGalleryState,
  ImageFilterOptions,
  ImageUploadData,
  ImageGalleryProps,
  ImageCardProps,
  CategoryFilterProps,
  SearchBarProps,
  SelectionPanelProps,
  ImageModalProps,
  UploadZoneProps,
  ImageCategory,
  SortField,
  SortOrder,
  ViewMode,
  ImageSearchResponse,
  ImageUploadResponse,
  ImageSelectionEvent
} from '../../types/image-selection';

// Export utilities
export {
  getAllImages,
  getImagesByCategory,
  getImageById,
  searchImages,
  getCategories,
  getCategoryByName,
  getPopularImages,
  getRecentlyUsedImages,
  getSuggestionsBasedOnSelection,
  CATEGORIES
} from '../../lib/image-selection/image-data';
