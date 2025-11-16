import React, { useState, useEffect } from "react";
import { Search, PersonAdd } from "@mui/icons-material";
import { useLazySearchUserQuery, useSendRequestMutation } from "../../redux/api/api";
import { useAsyncMutation } from "../../hooks/hook";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";

/**
 * Find Friends Component (iMessage style)
 * Allows users to search and send friend requests
 */
const FindFriends = ({ onClose }) => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  const [searchUser] = useLazySearchUserQuery("");
  const [sendRequest] = useAsyncMutation(useSendRequestMutation);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (search.trim()) {
        searchUser(search)
          .then(({ data }) => setUsers(data?.users || []))
          .catch((e) => console.log(e));
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [search, searchUser]);

  const handleSendRequest = async (userId) => {
    await sendRequest("Sending friend request...", userId);
    toast.success("Friend request sent!");
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'dark' : ''}`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className={`w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Find Friends
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
          {users.length === 0 && search.trim() ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No users found
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Search for users to send friend requests
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={user.avatar?.url || user.avatar || "/avatar.jpeg"}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setViewingImage(user.avatar?.url || user.avatar || "/avatar.jpeg");
                        setShowImageViewer(true);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.name}
                      </p>
                      <p className={`text-sm truncate ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(user._id)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark
                        ? 'hover:bg-gray-700 text-blue-400'
                        : 'hover:bg-blue-50 text-blue-500'
                    }`}
                  >
                    <PersonAdd />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt="Profile"
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default FindFriends;

