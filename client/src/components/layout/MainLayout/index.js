// client/src/components/layout/MainLayout/index.js

import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import Watermark from '../../common/Watermark';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <Watermark>
        <main className="flex-grow">{children}</main>
      </Watermark>
      <Footer />
    </div>
  );
};

export default MainLayout;
