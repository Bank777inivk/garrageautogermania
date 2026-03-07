import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-[120px] md:pt-[135px]"> {/* Increased padding-top for better spacing below fixed header */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
