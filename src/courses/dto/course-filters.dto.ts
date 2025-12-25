export interface CourseFilters {
  categories: FilterOption[];
  levels: FilterOption[];
  priceRanges: PriceRange[];
  languages: FilterOption[];
  ratings: FilterOption[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface PriceRange {
  min: number;
  max: number;
  label: string;
  count: number;
}
