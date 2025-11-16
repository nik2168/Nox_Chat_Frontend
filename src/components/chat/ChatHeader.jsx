import React, { useState } from "react";
import { ArrowBack, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import ImageViewer from "../common/ImageViewer";

/**
 * Chat Header Component (iMessage style)
 */
const ChatHeader = ({ chatName, isGroupChat, otherMember, chatId, avatar, onBack, onSettingsClick }) => {
  const navigate = useNavigate();
  const [showImageViewer, setShowImageViewer] = useState(false);
  const { onlineMembers, onlineChatMembers } = useSelector((state) => state.chat);

  const handleImageClick = () => {
    if (avatar) {
      setShowImageViewer(true);
    }
  };

  // Check if other member is online (chat-specific first, then overall)
  const isOnline = !isGroupChat && otherMember && (
    onlineChatMembers?.includes(otherMember._id?.toString()) ||
    onlineMembers?.includes(otherMember._id?.toString())
  );

  return (
    <>
    <div className="h-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 
                    flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onBack}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowBack className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div
          onClick={onSettingsClick}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 -ml-2 transition-colors"
        >
          <div className="relative flex-shrink-0">
            <img
              src={avatar || "/avatar.jpeg"}
              alt={chatName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {chatName}
            </h2>
            {!isGroupChat && otherMember && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOnline ? "online" : "offline"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <Info className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={avatar || "/avatar.jpeg"}
          alt={chatName}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
    </>
  );
};

export default ChatHeader;

