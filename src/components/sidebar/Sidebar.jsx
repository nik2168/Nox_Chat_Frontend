import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Add, Notifications, PersonAdd, Brightness4, Brightness7 } from "@mui/icons-material";
import { useMyChatsQuery } from "../../redux/api/api";
import ChatListItem from "./ChatListItem";
import CreateNewGroupModal from "../modals/CreateNewGroup";
import NotificationsPanel from "./NotificationsPanel";
import FindFriends from "./FindFriends";
import ProfileButton from "./ProfileButton";
import { formatChatTime } from "../../utils/dateFormatter";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * iMessage-style Sidebar Component
 * 
 * Features:
 * - Search bar at top
 * - Chat list with avatars
 * - Last message preview
 * - Unread badges
 * - Online indicators
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFindFriends, setShowFindFriends] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const { data, isLoading } = useMyChatsQuery(search);
  const myChats = data?.mychats || [];

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('system');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Messages
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Theme: ${themeMode === 'system' ? 'System' : themeMode === 'dark' ? 'Dark' : 'Light'}`}
            >
              {isDark ? (
                <Brightness7 className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Brightness4 className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setShowFindFriends(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Find Friends"
            >
              <PersonAdd className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              title="Notifications"
            >
              <Notifications className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Create Group"
            >
              <Add className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg 
                     border-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : myChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">No chats yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {myChats.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                onClick={() => navigate(`/chat/${chat._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Button at Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-2">
        <ProfileButton user={user} />
      </div>

      {/* Modals */}
      {showCreateGroup && (
        <CreateNewGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
      {showNotifications && (
        <NotificationsPanel onClose={() => setShowNotifications(false)} />
      )}
      {showFindFriends && (
        <FindFriends onClose={() => setShowFindFriends(false)} />
      )}
    </div>
  );
};

export default Sidebar;

