import React from "react";
import MessageBubble from "./MessageBubble";
import PollBubble from "./PollBubble";

/**
 * Message List Component
 * Renders all messages with iMessage-style bubbles
 */
const MessageList = ({ messages, user, isGroupChat, chatId }) => {
  // Find last message sent by current user for status display
  const myMessages = messages.filter(
    (msg) => msg.sender?._id?.toString() === user?._id?.toString()
  );
  const lastMyMessageId = myMessages[myMessages.length - 1]?._id;

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const isMyMessage = message.sender?._id?.toString() === user?._id?.toString();
        const isLastMessage = message._id === lastMyMessageId && isMyMessage;
        
        // Handle polls
        if (message.isPoll) {
          return (
            <PollBubble
              key={message._id || message.tempId || index}
              tempId={message.tempId || message._id}
              user={user}
              question={message.content}
              options={message.options}
              isMyMessage={isMyMessage}
              chatId={chatId}
            />
          );
        }
        
        return (
          <MessageBubble
            key={message._id || message.tempId || index}
            message={message}
            isMyMessage={isMyMessage}
            isGroupChat={isGroupChat}
            isLastMessage={isLastMessage}
          />
        );
      })}
    </div>
  );
};

export default MessageList;

