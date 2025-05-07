import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setKeyword, clearResults, searchProducts } from '../../../store/slices/searchSlice';
import { useDebounce } from '../../../hooks/useDebounce';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import RecentSearches from './RecentSearches';
import { useOutsideClick } from '../../../hooks/useOutsideClick';

const SearchBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [showRecent, setShowRecent] = useState(false);
  const searchRef = useRef(null);
  const { recentSearches } = useSelector((state) => state.search);

  // Debounce input to avoid too many API calls
  const debouncedValue = useDebounce(inputValue, 300);

  // Close dropdown when clicking outside
  useOutsideClick(searchRef, () => {
    setShowRecent(false);
  });

  // Perform search when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 2) {
      dispatch(searchProducts(debouncedValue));
    } else {
      dispatch(clearResults());
    }
  }, [debouncedValue, dispatch]);

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Show recent searches dropdown when typing
    if (value.length > 0) {
      setShowRecent(true);
    } else {
      setShowRecent(false);
      dispatch(clearResults());
    }
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch(setKeyword(inputValue));
      navigate(`/search?q=${encodeURIComponent(inputValue)}`);
      setShowRecent(false);
    }
  };

  // Select recent search
  const handleSelectRecent = (term) => {
    setInputValue(term);
    dispatch(setKeyword(term));
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setShowRecent(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={inputValue}
          onChange={handleChange}
          onFocus={() => inputValue && setShowRecent(true)}
          className="w-full rounded-r-none"
        />
        <Button type="submit" variant="primary" className="rounded-l-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </Button>
      </form>

      {/* Recent searches dropdown */}
      {showRecent && recentSearches.length > 0 && (
        <RecentSearches searches={recentSearches} onSelect={handleSelectRecent} />
      )}
    </div>
  );
};

export default SearchBar;
