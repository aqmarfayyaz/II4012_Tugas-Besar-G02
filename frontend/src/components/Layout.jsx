import React from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const Layout = ({ children, title = 'Dashboard' }) => {
  return (
    <div className="flex bg-background">
      <Sidebar />
      <div className="flex-1 ml-[280px]">
        <TopNavBar title={title} />
        <main className="pt-20 min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
