import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Logout } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { userNotExists } from "../../redux/reducer/authslice";
import axios from "axios";
import { server } from "../../constants/config";
import ImageViewer from "../common/ImageViewer";

/**
 * Profile Button Component (Bottom of sidebar)
 */
const ProfileButton = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { onlineMembers } = useSelector((state) => state.chat);
  const [showMenu, setShowMenu] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  // Check if current user is online
  const isUserOnline = user && onlineMembers?.includes(user._id?.toString());

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (user?.avatar?.url || user?.avatar) {
      setShowImageViewer(true);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${server}/api/v1/user/logout`, {}, { withCredentials: true });
      localStorage.removeItem("chatapp-token");
      dispatch(userNotExists());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <img
          src={user?.avatar?.url || user?.avatar || "/avatar.jpeg"}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleImageClick}
        />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </p>
            {isUserOnline && (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isUserOnline ? "online" : "offline"}
          </p>
        </div>
      </button>

      {showMenu && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 
                        rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => {
              setShowMenu(false);
              navigate("/profile");
            }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Logout className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-900 dark:text-white">Logout</span>
          </button>
        </div>
      )}
      {showImageViewer && (
        <ImageViewer
          imageUrl={user?.avatar?.url || user?.avatar || "/avatar.jpeg"}
          alt={user?.name || "Profile"}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default ProfileButton;

