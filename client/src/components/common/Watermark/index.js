// client/src/components/common/Watermark/index.js

import React from 'react';

const Watermark = ({ children }) => {
  return (
    <div className="relative">
      {children}
      <div className="absolute bottom-4 right-4 opacity-30 text-gray-500 font-bold rotate-330 select-none pointer-events-none">
        © Steve
      </div>
    </div>
  );
};

export default Watermark;
