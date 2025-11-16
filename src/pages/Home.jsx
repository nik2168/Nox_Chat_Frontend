import React from "react";
import iMessageLayout from "../components/layouts/iMessageLayout";
import Sidebar from "../components/sidebar/Sidebar";
import EmptyState from "../components/chat/EmptyState";
import GlobalSocketListeners from "../components/common/GlobalSocketListeners";

/**
 * Home Page - Chat List View (iMessage style)
 */
const Home = () => {
  return (
    <>
      <GlobalSocketListeners />
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Chat List */}
        <div className="w-full lg:w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 overflow-hidden">
          <Sidebar />
        </div>

        {/* Empty State */}
        <div className="hidden lg:flex flex-1">
          <EmptyState />
        </div>
      </div>
    </>
  );
};

export default Home;
