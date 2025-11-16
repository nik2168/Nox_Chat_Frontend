import React, { useState } from "react";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "../ChatComp/RenderAttachment";
import { Box } from "@mui/material";
import ImageViewer from "../common/ImageViewer";

// Format read timestamp in iMessage style
const formatReadTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

/**
 * Message Bubble Component (iMessage style)
 * 
 * Features:
 * - Blue bubbles for sent messages
 * - Gray bubbles for received messages
 * - Avatar for received messages in group chats
 * - Attachments support (images, videos, files, audio)
 */
const MessageBubble = ({ message, isMyMessage, isGroupChat, isLastMessage }) => {
  const { content, attachments, sender, createdAt, isSending } = message;
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  const timeAgo = moment(createdAt).fromNow();

  const handleImageClick = (url) => {
    setViewingImage(url);
    setShowImageViewer(true);
  };

  // Render attachments
  const renderAttachments = () => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="space-y-2">
        {attachments.map((att, idx) => {
          const url = att.url;
          const file = fileFormat(url);
          
          // For images, make them clickable to view in full screen
          if (file === "img") {
            return (
              <Box key={idx}>
                <img
                  src={url}
                  alt={att.originalName || "Image"}
                  className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(url)}
                />
              </Box>
            );
          }
          
          return (
            <Box key={idx}>
              <a href={url} target="_blank" download className="block">
                {RenderAttachment(file, url)}
              </a>
              {file === "file" && (
                <p className="text-sm mt-1">{att.originalName || "Attachment"}</p>
              )}
            </Box>
          );
        })}
      </div>
    );
  };

  if (isMyMessage) {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[70%] lg:max-w-[60%]">
          <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm">
            {renderAttachments()}
            {content && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                {content}
              </p>
            )}
            {isSending && (
              <div className="flex justify-end mt-1">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 mt-1 px-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {isGroupChat && (
        <img
          src={sender?.avatar?.url || sender?.avatar || "/avatar.jpeg"}
          alt={sender?.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleImageClick(sender?.avatar?.url || sender?.avatar || "/avatar.jpeg")}
        />
      )}
      <div className="max-w-[70%] lg:max-w-[60%]">
        {isGroupChat && (
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 px-2">
            {sender?.name}
          </p>
        )}
        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                        rounded-2xl rounded-tl-sm px-4 py-2 shadow-sm">
          {renderAttachments()}
          {content && (
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">{timeAgo}</span>
        </div>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt="Message image"
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default MessageBubble;

