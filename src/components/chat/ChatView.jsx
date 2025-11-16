import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { useInfiniteScrollTop } from "6pp";
import { useGetChatDetailsQuery, useGetMessagesQuery } from "../../redux/api/api";
import { 
  setAllMessages, 
  removeNewMessagesAlert, 
  setTyping,
  setChatOnlineMembers,
  updateAMessage,
  setNewGroupAlert
} from "../../redux/reducer/chat";
import { 
  NEW_MESSAGE, 
  CHAT_JOINED, 
  CHAT_LEAVE,
  START_TYPING,
  STOP_TYPING,
  CHAT_ONLINE_USERS,
  UPDATE_POLL,
  ALERT,
} from "../../constants/events";
import { getSocket } from "../../socket";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import ChatFilesMenu from "../ChatComp/ChatFilesMenu";
import ChatProfile from "./ChatProfile";
import PollModal from "./PollModal";
import { Skeleton } from "@mui/material";

/**
 * Complete Chat View Component (iMessage style)
 * 
 * Features:
 * - Message sending/receiving
 * - Attachments (photos, videos, files, audio)
 * - Polls
 * - Typing indicators
 * - Infinite scroll
 * - Group/Chat settings
 * - Status updates
 */
const ChatView = ({ chatId, onBack }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    allMessages, 
    isTyping, 
    onlineMembers,
    onlineChatMembers,
    allChatsIsTyping
  } = useSelector((state) => state.chat);
  const socket = getSocket();
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [imTyping, setImTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const scrollElement = useRef(null);
  const chat = useRef(null);
  const clearTime = useRef(null);
  const [showChatProfile, setShowChatProfile] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);

  // Fetch chat details and messages
  const chatDetails = useGetChatDetailsQuery({ chatid: chatId, populate: true });
  const oldMessagesChunk = useGetMessagesQuery({ chatid: chatId, page });
  
  const error = [
    { error: chatDetails?.error, isError: chatDetails?.isError },
    { error: oldMessagesChunk?.error, isError: oldMessagesChunk?.isError },
  ];
  
  useErrors(error);

  const curChat = chatDetails?.data?.curchat;
  const members = curChat?.members;

  // Infinite scroll
  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    scrollElement,
    oldMessagesChunk?.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk?.data?.messages
  );

  // Combine old and new messages
  useEffect(() => {
    dispatch(setAllMessages([...oldMessages, ...messages]));
  }, [oldMessages, messages, dispatch]);

  // Auto-scroll to bottom (skip when we explicitly disable, e.g. poll updates)
  useEffect(() => {
    if (!shouldAutoScrollRef.current) {
      // Reset the flag but skip auto-scroll for this update
      shouldAutoScrollRef.current = true;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  // Socket listeners setup
  useEffect(() => {
    if (!socket || !chatId || !members) return;

    // Join chat
    socket.emit(CHAT_JOINED, { 
      userId: user._id, 
      members: members.map(m => m._id || m),
      chatid: chatId 
    });

    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setOldMessages([]);
      setPage(1);
      setMessages([]);
      setMessage("");
      if (members) {
        socket.emit(CHAT_LEAVE, { 
          userId: user._id, 
          members: members.map(m => m._id || m),
          chatid: chatId 
        });
      }
    };
  }, [chatId, members, socket, user, dispatch]);

  // New message listener
  const newMessageListener = useCallback(
    ({ chatId: receivedChatId, message: newMessage }) => {
      if (receivedChatId?.toString() !== chatId?.toString()) return;
      shouldAutoScrollRef.current = true;
      setMessages((prev) => [...prev, newMessage]);
    },
    [chatId]
  );

  // Typing listeners
  const startTypingListener = useCallback((data) => {
    if (data.filteredMembers.includes(user._id.toString())) {
      if (data?.chatid.toString() !== chatId.toString()) return;
      dispatch(setTyping(true));
    }
  }, [chatId, user, dispatch]);

  const stopTypingListener = useCallback((data) => {
    if (data.filteredMembers.includes(user._id.toString())) {
      if (data?.chatid.toString() !== chatId.toString()) return;
      dispatch(setTyping(false));
    }
  }, [chatId, user, dispatch]);

  // Poll update listener
  const updatePollListener = useCallback(
    ({ tempId, messageData, chatId: receivedChatId, userId }) => {
      if (receivedChatId.toString() !== chatId.toString()) return;
      // Poll option updates should NOT force scroll to bottom
      shouldAutoScrollRef.current = false;
      dispatch(updateAMessage({ tempId, messageData }));
    },
    [chatId, dispatch]
  );

  // Chat online users listener
  const chatOnlineUsersListener = useCallback(({ chatOnlineMembers, chatId: receivedChatId }) => {
    if (receivedChatId.toString() !== chatId.toString()) return;
    dispatch(setChatOnlineMembers(chatOnlineMembers));
  }, [chatId, dispatch]);

  // Alert listener
  const alertListener = useCallback((data) => {
    if (data?.chatid?.toString() !== chatId?.toString()) return;
    dispatch(setNewGroupAlert(data));
  }, [chatId, dispatch]);

  // Setup socket event handlers
  const eventHandler = {
    [NEW_MESSAGE]: newMessageListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [UPDATE_POLL]: updatePollListener,
    [CHAT_ONLINE_USERS]: chatOnlineUsersListener,
    [ALERT]: alertListener,
  };

  useSocketEvents(socket, eventHandler);

  // Message input handler with typing indicator
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    let filteredMembers = [];
    members?.map((i) => {
      if (i._id.toString() !== user._id.toString())
        filteredMembers.push(i._id.toString());
    });
    
    if (!imTyping) {
      socket.emit(START_TYPING, {
        filteredMembers,
        chatid: chatId,
        username: user.name,
      });
      setImTyping(true);
    }

    if (clearTime.current) clearTimeout(clearTime.current);

    clearTime.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { filteredMembers, chatid: chatId });
      setImTyping(false);
    }, 2000);
  };

  // Send message handler
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!message.trim() || !socket || !members) return;

    let membersId = [];
    members.map((i) => {
      if (i._id.toString() !== user._id.toString()) membersId.push(i._id);
    });

    shouldAutoScrollRef.current = true;
    socket.emit(NEW_MESSAGE, {
      chatid: chatId,
      members: membersId,
      message: message.trim(),
      otherMember: curChat?.groupChat ? null : members.find(m => m._id.toString() !== user._id.toString()),
      isChatOnline: onlineChatMembers.includes(members.find(m => m._id.toString() !== user._id.toString())?._id.toString()),
    });

    setMessage("");
  };

  // Poll submit handler
  const handlePollSubmit = ({ question, options }) => {
    if (!question.trim() || !members) return;

    let membersId = [];
    members.map((i) => {
      if (i._id.toString() !== user._id.toString()) membersId.push(i._id);
    });

    shouldAutoScrollRef.current = true;
    socket.emit(NEW_MESSAGE, {
      chatid: chatId,
      members: membersId,
      message: question,
      otherMember: curChat?.groupChat ? null : members.find(m => m._id.toString() !== user._id.toString()),
      isPoll: true,
      options,
      isChatOnline: onlineChatMembers.includes(members.find(m => m._id.toString() !== user._id.toString())?._id.toString()),
    });
  };

  if (chatDetails?.isLoading) {
    return (
      <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="flex-1 w-full" />
      </div>
    );
  }

  const isGroupChat = curChat?.groupChat || false;
  const otherMember = curChat?.members?.find(
    (m) => (m._id?.toString() || m.toString()) !== user?._id?.toString()
  );
  const chatName = isGroupChat ? curChat?.name : otherMember?.name || "Chat";
  const avatar = isGroupChat 
    ? curChat?.avatar?.url || curChat?.avatar 
    : otherMember?.avatar?.url || otherMember?.avatar;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900" ref={chat}>
      {/* Chat Profile Modal */}
      {showChatProfile && curChat && (
        <ChatProfile
          chat={curChat}
          chatId={chatId}
          onClose={() => setShowChatProfile(false)}
        />
      )}

      {/* Header */}
      <ChatHeader
        chatName={chatName}
        isGroupChat={isGroupChat}
        otherMember={otherMember}
        chatId={chatId}
        avatar={avatar}
        onBack={onBack}
        onSettingsClick={() => setShowChatProfile(true)}
      />

      {/* Messages */}
      <div
        ref={scrollElement}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar"
        onClick={() => {
          if (chat?.current) {
            chat.current.classList.remove("active-files");
          }
        }}
      >
        <MessageList 
          messages={allMessages} 
          user={user} 
          isGroupChat={isGroupChat}
          chatId={chatId}
        />
        {isTyping && (
          <TypingIndicator 
            name={allChatsIsTyping?.typingChatid?.toString() === chatId?.toString() 
              ? allChatsIsTyping?.name 
              : null}
            isGroupChat={isGroupChat}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        message={message}
        setMessage={handleMessageChange}
        onSend={handleSendMessage}
        chat={chat}
      />

      {/* Files Menu */}
      <ChatFilesMenu 
        chat={chat} 
        chatid={chatId} 
        onPollClick={() => setShowPollModal(true)}
      />

      {/* Poll Modal */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        onSubmit={handlePollSubmit}
      />
    </div>
  );
};

export default ChatView;
