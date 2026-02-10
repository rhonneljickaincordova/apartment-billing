import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

/**
 * Searchable Select Component
 * A dropdown select with search/filter functionality
 */
function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  error = false,
  disabled = false,
  renderOption = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const colorMap = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    gray: 'bg-gray-500',
    slate: 'bg-slate-500',
    amber: 'bg-amber-500',
    lime: 'bg-lime-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    stone: 'bg-stone-500',
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 text-left border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        } ${
          disabled
            ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
            : 'bg-white dark:bg-gray-700 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <span className={`flex items-center gap-2 truncate ${
          selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {selectedOption ? (
            <>
              {selectedOption.color && (
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMap[selectedOption.color] || 'bg-gray-500'}`} />
              )}
              {selectedOption.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <div className="flex items-center gap-1">
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors ${
                    option.value === value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.color && (
                    <span className={`w-3 h-3 rounded-full flex-shrink-0 ${colorMap[option.color] || 'bg-gray-500'}`} />
                  )}
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
