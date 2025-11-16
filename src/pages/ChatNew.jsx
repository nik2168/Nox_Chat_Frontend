import React from "react";
import { useParams } from "react-router-dom";
import iMessageLayout from "../components/layouts/iMessageLayout";
import Sidebar from "../components/sidebar/Sidebar";
import ChatView from "../components/chat/ChatView";
import GlobalSocketListeners from "../components/common/GlobalSocketListeners";

/**
 * Chat Page - Individual Chat View (iMessage style)
 */
const ChatNew = () => {
  const { chatid } = useParams();

  return (
    <>
      <GlobalSocketListeners />
      <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Chat List */}
      <div className="hidden lg:block w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0 overflow-hidden">
        <Sidebar />
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {chatid ? (
          <ChatView chatId={chatid} />
        ) : (
          <div className="hidden lg:flex flex-1">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a chat from the sidebar to start messaging
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default ChatNew;

