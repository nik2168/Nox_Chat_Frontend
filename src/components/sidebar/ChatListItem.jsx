import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatChatTime } from "../../utils/dateFormatter";
import ImageViewer from "../common/ImageViewer";

/**
 * Chat List Item Component (iMessage style)
 * 
 * Displays:
 * - Avatar with online indicator
 * - Chat name
 * - Last message preview
 * - Timestamp
 * - Unread badge
 */
const ChatListItem = ({ chat, onClick }) => {
  const { user } = useSelector((state) => state.auth);
  const { onlineMembers } = useSelector((state) => state.chat);
  const [showImageViewer, setShowImageViewer] = useState(false);
  
  // Determine chat name and avatar
  const isGroupChat = chat.groupChat;
  const otherMember = chat.members?.find(
    (m) => m._id?.toString() !== user?._id?.toString()
  );
  const chatName = isGroupChat ? chat.name : otherMember?.name || "Unknown";
  const chatAvatar = isGroupChat 
    ? chat.avatar?.url || chat.avatar 
    : otherMember?.avatar?.url || otherMember?.avatar;

  // Check if other user is online
  const isOnline = !isGroupChat && onlineMembers?.includes(otherMember?._id?.toString());

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (chatAvatar) {
      setShowImageViewer(true);
    }
  };

  // Get last message - check different possible structures
  const lastMessage = chat.lastMessage || chat.latestMessage;
  const lastMessageText = lastMessage?.content 
    ? (lastMessage.content.length > 50 
        ? lastMessage.content.substring(0, 50) + "..." 
        : lastMessage.content)
    : "No messages yet";
  const lastMessageTime = formatChatTime(chat.updatedAt || chat.createdAt || lastMessage?.createdAt);

  // Unread count - check different possible structures
  const unreadCount = chat.unreadCount || chat.unreadMessages || 0;

  return (
    <div
      onClick={onClick}
      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer 
                 transition-colors flex items-center gap-3 group"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={chatAvatar || "/avatar.jpeg"}
          alt={chatName}
          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleImageClick}
        />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {chatName}
          </h3>
          {lastMessageTime && (
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
              {lastMessageTime}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {lastMessageText}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={chatAvatar || "/avatar.jpeg"}
          alt={chatName}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default ChatListItem;

