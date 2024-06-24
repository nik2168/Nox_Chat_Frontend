import { useInfiniteScrollTop } from "6pp";
import {
  Add,
  ArrowBackIosNew,
  EmojiEmotions,
  MoreVert,
  Send,
} from "@mui/icons-material";
import { Skeleton } from "@mui/material";
import React, {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout/AppLayout";
import ChatFilesMenu from "../components/ChatComp/ChatFilesMenu.jsx";
import ChatSettings from "../components/ChatComp/ChatSettings";
import Messages from "../components/ChatComp/Messages";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVE,
  LAST_CHAT_ONLINE,
  LAST_ONLINE,
  NEW_MESSAGE,
  REFETCH_CHATS,
  REFETCH_MESSAGES,
  START_TYPING,
  STOP_TYPING,
} from "../constants/events.js";
import { useErrors, useSocketEvents } from "../hooks/hook.jsx";
import {
  useGetChatDetailsQuery,
  useGetMessagesQuery,
  useLazyChangeMessageToOnlineQuery,
  useLazyChangeMessageToSeenQuery,
} from "../redux/api/api.js";
import {
  removeNewMessagesAlert,
  setNewGroupAlert,
} from "../redux/reducer/chat.js";
import { getSocket } from "../socket";
import moment from "moment";

// import GroupSettings from "../components/ChatComp/groupsettings";
const GroupSettings = lazy(() =>
  import("../components/ChatComp/groupsettings")
);
const ChatSetting = lazy(() =>
  import("../components/ChatComp/chatsetting.jsx")
);

const Chat = ({ chatid, allChats, navbarref }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Cur User

  const { onlineMembers } = useSelector((state) => state.chat); // Cur User
  const { onlineChatMembers } = useSelector((state) => state.chat);
  const { isTyping } = useSelector((state) => state.chat);
  const { allChatsIsTyping } = useSelector((state) => state.chat); // Cur User
  const { newGroupAlert } = useSelector((state) => state.chat); // Cur User

  const [message, setcurmessage] = useState(""); // CurMessage
  const [messages, setMessages] = useState([]); // Messages List
  const [allMessages, setAllMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [imTyping, setImTyping] = useState(false);
  const [onlineLastSeen, setOnlineLastSeen] = useState("");

  const navigate = useNavigate();

  const scrollElement = useRef(); // for infinite scroll

  const groupsetting = useRef();

  const chatsetting = useRef();

  const clearTime = useRef();

  const addMemberWindow = useRef();

  const chat = useRef(); // ref to chat

  const chatDetails = useGetChatDetailsQuery({ chatid, populate: true });
  const oldMessagesChunk = useGetMessagesQuery({ chatid, page });

  const error = [
    { error: chatDetails?.error, isError: chatDetails?.isError },
    { error: oldMessagesChunk?.error, isError: oldMessagesChunk?.isError },
  ];

  useEffect(() => {
    if (chatDetails.error) return navigate("/");
  }, [chatDetails.error]);

  useErrors(error);

  const curChat = chatDetails?.data?.curchat;
  const members = curChat?.members;

  const chatOnlineUsersMap = new Map(Object.entries(onlineChatMembers));

  const curChatMembersName = curChat?.members.map((i) => i.name).join(", ");
  let avatar = curChat?.avatar?.url;
  let name = curChat?.name;
  let otherMember = "";
  if (!curChat?.groupChat) {
    otherMember = curChat?.members.find(
      (i) => i._id.toString() !== user._id.toString()
    );
    avatar = otherMember?.avatar?.url;
    name = otherMember?.name;
  }

  const lastSeenTime = otherMember?.lastSeen;

  let isOnline = false;
  let isChatOnline = false;
  if (!curChat?.groupChat) {
    isOnline = onlineMembers.includes(otherMember?._id.toString());
    if (
      chatOnlineUsersMap?.has(otherMember?._id?.toString()) &&
      chatOnlineUsersMap?.get(otherMember?._id?.toString()).toString() ===
        chatid.toString()
    ) {
      isChatOnline = true;
    }
  }

  // last seen for message seen, received status ....
  useEffect(() => {
    setOnlineLastSeen(otherMember?.lastSeen);
  }, [chatDetails?.data]);

  // infinite scroll
  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    scrollElement,
    oldMessagesChunk?.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk?.data?.messages
  );

  useEffect(() => {
    if (members)
      socket.emit(CHAT_JOINED, { userId: user._id, members, chatid });

    dispatch(removeNewMessagesAlert(chatid));

    return () => {
      setOldMessages([]);
      setPage(1);
      setMessages([]);
      setcurmessage("");
      if (members)
        socket.emit(CHAT_LEAVE, { userId: user._id, members, chatid });
    };
  }, [chatid, members]);

  useEffect(() => {
    setAllMessages([...oldMessages, ...messages]);
  }, [oldMessages, messages]);

  const socket = getSocket();

  const messageSubmitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // emitting message to the server ...
    socket.emit(NEW_MESSAGE, {
      chatid,
      members,
      message,
      otherMember,
      isChatOnline,
    });
    setcurmessage("");
  };

  const onChangeHandler = (e) => {
    setcurmessage(e.target.value);
    const filteredMembers = members.filter(
      (i) => i._id.toString() !== user._id.toString()
    );
    if (!imTyping) {
      socket.emit(START_TYPING, {
        filteredMembers,
        chatid,
        username: user.name,
      });
      setImTyping(true);
    }

    if (clearTime.current) clearTimeout(clearTime.current);

    clearTime.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { filteredMembers, chatid });
      setImTyping(false);
    }, [2000]);
  };

  // will use newMessages function inside useCallback so that it won't created everytime we got new message
  const newMessageListner = useCallback(({ chatId, message }) => {
    if (chatId.toString() !== chatid.toString()) {
      console.log("return chat id not matched !");
      return;
    }

    setMessages((pre) => [...pre, message]);
  }, []);

  // update message status for other users
  const lastOnlineListner = useCallback((data) => {
    setOnlineLastSeen(data);
  }, []);

  const alertListener = useCallback(
    (data) => {
      if (data?.chatid?.toString() !== chatid?.toString()) return;
      setNewGroupAlert(dispatch(data));
    },
    [chatid]
  );

  const events = {
    [NEW_MESSAGE]: newMessageListner,
    [ALERT]: alertListener,
    [LAST_ONLINE]: lastOnlineListner,
  };

  useSocketEvents(socket, events); // using a custom hook to listen for events array

  return chatDetails?.isLoading ? (
    <Skeleton className="chat" />
  ) : (
    <section className="chat" ref={chat}>
      {curChat?.groupChat ? (
        <Suspense fallback={<Skeleton />}>
          <GroupSettings
            groupsetting={groupsetting}
            curChat={curChat}
            addMemberWindow={addMemberWindow}
            chatid={chatid}
            oldMessagesChunk={oldMessagesChunk}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<Skeleton />}>
          <ChatSetting
            chatsetting={chatsetting}
            curChat={curChat}
            avatar={avatar}
            name={name}
            addMemberWindow={addMemberWindow}
            chatid={chatid}
          />
        </Suspense>
      )}

      <div className="chat-person-div">
        <button
          className="backButton"
          onClick={() => {
            // allChats.current.style.zIndex = "4";
            // navbarref.current.style.zIndex = "5";
            navigate("/");
            setOldMessages([]);
            setPage(1);
            setMessages([]);
            setcurmessage("");
            if (members) socket.emit(CHAT_LEAVE, { userId: user._id, members });
          }}
        >
          <ArrowBackIosNew sx={{ width: "2rem", height: "2rem" }} />
        </button>

        <div
          className="person-dp"
          onClick={() => {
            if (curChat?.groupChat) {
              groupsetting.current.classList.add("active");
              return;
            }
            chatsetting.current.classList.add("active");
          }}
        >
          <img
            src={avatar}
            alt="img"
            className="person-image"
            style={{ height: "70px", width: "70px" }}
          />
          {isOnline && <div className="online"></div>}
        </div>

        <div className="chat-person-details">
          <h5>{name}</h5>
          {isTyping ? (
            curChat?.groupChat ? (
              <p className="chattypingspan">
                {allChatsIsTyping?.typingChatid.toString() ===
                  chatid.toString() &&
                  allChatsIsTyping?.isTyping &&
                  `${allChatsIsTyping?.name}: `}
                typing ...
              </p>
            ) : (
              <p className="chattypingspan">typing ...</p>
            )
          ) : (
            curChat?.groupChat && (
              <p className="chattypingspan" style={{ color: "whitesmoke" }}>
                {curChatMembersName.slice(0, 30)}
                {curChatMembersName.length > 29 && " ..."}
              </p>
            )
          )}
          {(!isTyping && !curChat?.groupChat && isChatOnline && (
            <p className="chattypingspan">online</p>
          )) ||
            (!curChat?.groupChat && !isOnline && (
              <p className="chattypingspan" style={{ color: "whitesmoke" }}>
                {`last seen ${moment(lastSeenTime).fromNow()}`}
              </p>
            ))}
          {/* {isOnline ? <span>Online</span> : <span>Offline</span>} */}
        </div>

        <span
          className="morevert chatsettingsSpan"
          onClick={() => {
            if (!chat.current.classList.contains("activesettings")) {
              chat.current.classList.add("activesettings");
              return;
            }
            chat.current.classList.remove("activesettings");
          }}
        >
          <MoreVert sx={{ color: "#f9fafb" }} />
        </span>
      </div>

      <ChatSettings />

      {chatDetails?.isLoading ? (
        <Skeleton />
      ) : (
        <Messages
          user={user}
          scrollElement={scrollElement}
          allMessages={allMessages}
          chat={chat}
          messages={messages}
          groupChat={curChat?.groupChat}
          otherMember={otherMember}
          isOnline={isOnline}
          isChatOnline={isChatOnline}
        />
      )}

      <form
        className="chat-message-div"
        onSubmit={(e) => messageSubmitHandler(e)}
      >
        <span className="addspan">
          <Add
            sx={{
              fontSize: "2.6rem",
            }}
            onClick={(e) => {
              if (!chat.current.classList.contains("active-files")) {
                chat.current.classList.add("active-files");
                return;
              }
              chat.current.classList.remove("active-files");
            }}
          />
        </span>

        <div className="message-div">
          <input
            type="text"
            className="chat-message"
            value={message}
            onChange={(e) => onChangeHandler(e)}
          />

          <EmojiEmotions
            sx={{
              position: "absolute",
              right: "0.5rem",
            }}
          />
        </div>

        <button
          type="button"
          className="sendmessage"
          onClick={(e) => messageSubmitHandler(e)}
        >
          <Send
            sx={{
              color: "#f9fafb",
              marginRight: "2rem",
              fontSize: "1.8rem",
              position: "absolute",
              right: "-0.9rem",
            }}
          />
        </button>
      </form>

      <ChatFilesMenu chat={chat} chatid={chatid} />
    </section>
  );
};

export default AppLayout()(Chat);
