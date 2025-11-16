import React from "react";
import { Send, AttachFile } from "@mui/icons-material";

/**
 * Message Input Component (iMessage style)
 */
const MessageInput = ({ message, setMessage, onSend, chat }) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  const handleAttachClick = () => {
    if (chat?.current) {
      chat.current.classList.toggle("active-files");
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
      <form onSubmit={onSend} className="flex items-end gap-2">
        <button
          type="button"
          onClick={handleAttachClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <AttachFile className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            rows={1}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full 
                     border-none focus:outline-none focus:ring-2 focus:ring-blue-500 
                     resize-none text-gray-900 dark:text-white placeholder-gray-500 
                     dark:placeholder-gray-400 max-h-32 overflow-y-auto"
            style={{ minHeight: "40px" }}
          />
        </div>

        <button
          type="submit"
          disabled={!message.trim()}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="text-white" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

