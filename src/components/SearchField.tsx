import { CloseIcon, SearchIcon } from './icons';
import './SearchField.css';

export interface SearchFieldProps {
  label: string;
  placeholder?: string;
  /** Part 1 only. In Part 3 turn this into a controlled input (value + onChange) */
  defaultValue?: string;
}

export function SearchField({ label, placeholder = 'Search', defaultValue = '' }: SearchFieldProps) {
  return (
    <div className="search-field">
      <SearchIcon className="search-field-icon" />
      <input
        className="search-field-input"
        type="search"
        aria-label={label}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      {defaultValue && (
        <button type="button" className="icon-btn search-field-clear" aria-label="Clear search">
          <CloseIcon size={12} />
        </button>
      )}
    </div>
  );
}
