import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import ChatView from "../chat/ChatView";
import EmptyState from "../chat/EmptyState";

/**
 * iMessage-style Layout Component
 * 
 * Structure:
 * - Left sidebar: Chat list (like iMessage on Mac)
 * - Right side: Chat view or empty state
 * - Responsive: Sidebar collapses on mobile
 */
const iMessageLayout = ({ children }) => {
  const { chatid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Chat List (iMessage style) */}
      <div
        className={`
          ${sidebarOpen ? "w-80" : "w-0"} 
          ${chatid ? "hidden lg:block" : "block"}
          transition-all duration-300 ease-in-out
          border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
          flex-shrink-0
          overflow-hidden
        `}
      >
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {chatid ? (
          <ChatView chatId={chatid} />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && chatid && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default iMessageLayout;

