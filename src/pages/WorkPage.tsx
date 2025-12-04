import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MainView from '../components/MainView';

const WorkPage: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-[#0f0c29] text-white font-sans overflow-hidden">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
      />
      <MainView />
    </div>
  );
};

export default WorkPage;
