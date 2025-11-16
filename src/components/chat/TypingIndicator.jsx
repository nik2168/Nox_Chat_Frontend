import React from "react";

/**
 * Typing Indicator Component (iMessage style)
 */
const TypingIndicator = ({ name, isGroupChat }) => {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        {isGroupChat && name && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{name}</p>
        )}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

