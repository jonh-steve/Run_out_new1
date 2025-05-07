import React from 'react';

const RecentSearches = ({ searches, onSelect }) => {
  if (searches.length === 0) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
      <div className="p-2 text-sm text-gray-500 border-b">Tìm kiếm gần đây</div>
      <ul>
        {searches.map((term, index) => (
          <li key={index}>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center"
              onClick={() => onSelect(term)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSearches;
