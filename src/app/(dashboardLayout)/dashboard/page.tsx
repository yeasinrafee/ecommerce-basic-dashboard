"use client";

import HomePage from "@/components/Dashboard/Home/Home";
import { routes } from "@/components/Dashboard/Routes/Routes";
import Header from "@/components/Dashboard/Shared/Header";
import Sidebar from "@/components/Dashboard/Shared/Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type React from "react";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminCustomLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <div className="flex h-screen bg-gray-50  dark:bg-black dark:text-white">
      {/* Sidebar */}
      <Sidebar
        routes={routes()}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <Header
          onMenuClick={toggleMobileSidebar}
          showMenuButton={isMobile}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-6"><HomePage/></main>
      </div>
    </div>
  );
};

export default AdminCustomLayout;
