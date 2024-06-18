import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../Css/allchats.css";
import "../../Css/chat.css";
import "../../Css/creategroup.css";
import "../../Css/groupsettings.css";
import "../../Css/login.css";
import "../../Css/navbar.css";
import "../../Css/profilewindow.css";
import "../../Css/responsiveAllChats.css";
import "../../Css/responsiveChat.css";
import "../../Css/responsiveNavbar.css";
import "../../Css/noxVerse.css";
import "../../Css/noxVerseResponsive.css";
import "../../Css/responsiveCreateGroup.css";
import Title from "../shared/Title";
import Navbar from "./Navbar";

import {
  CHAT_ONLINE_USERS,
  MEMBER_REMOVED,
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
  START_TYPING,
  STOP_TYPING,
} from "../../constants/events.js";
import { useErrors, useSocketEvents } from "../../hooks/hook.jsx";
import { getSocket } from "../../socket.jsx";
import AllChats from "../ChatList/allChats";
import { useDispatch, useSelector } from "react-redux";
import {
  incrementNotification,
  setAllChatsTyping,
  setChatOnlineMembers,
  setNewMessagesAlert,
  setOnlineMembers,
  setTyping,
} from "../../redux/reducer/chat.js";
import { useNavigate, useParams } from "react-router-dom";
import NoxVerse from "../Nox Verse/NoxVerse.jsx";
import {
  useLazyChangeMessageToOnlineQuery,
  useMyChatsQuery,
} from "../../redux/api/api.js";

const AppLayout = () => (WrapComp) => {
  return (props) => {
    const { isTyping } = useSelector((state) => state.chat); // Cur User
    const { user } = useSelector((state) => state.auth); // Cur User
    const navigate = useNavigate();

    const { chatid } = useParams();
    const allChats = useRef(); // ref to chat
    const navbarref = useRef(); // ref to chat
    const [playsound, setPlaySound] = useState(false);

    const [curnav, setnav] = useState("chats");
    const dispatch = useDispatch();

    const socket = getSocket();

    const [search, setSearch] = useState("");

    // // marked all messages to online
    // const [updateMessageSendToOnline] = useLazyChangeMessageToOnlineQuery();

    // useEffect(() => {
    //   // marked all send messages to online if user is online

    //   updateMessageSendToOnline()
    //     .then(({ data }) => console.log(data?.message))
    //     .catch((e) => console.log(e));
    // }, []);

    // my chats fetching ...
    const { isLoading, data, isError, error, refetch } =
      useMyChatsQuery(search);
    useErrors([{ isError, error }]);

    const newMessagesAlert = useCallback(
      (data) => {
        if (chatid === data?.chatid) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatid]
    );

    const newRequestAlert = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const startTypingListner = useCallback(
      (data) => {
        dispatch(
          setAllChatsTyping({
            isTyping: true,
            typingChatid: data?.chatid,
            name: data?.username,
          })
        );
        if (data?.chatid.toString() !== chatid.toString()) return;
        dispatch(setTyping(true));
      },
      [chatid]
    );

    const stopTypingListner = useCallback(
      (data) => {
        dispatch(
          setAllChatsTyping({
            isTyping: false,
            typingChatid: data?.chatid,
          })
        );

        if (data?.chatid.toString() !== chatid.toString()) return;
        dispatch(setTyping(false));
      },
      [chatid]
    );

    const refetchListner = useCallback(() => {
      refetch();
    }, [refetch]);

    const refetchNewMembers = useCallback(
      (data) => {
        if (data?.userId === user._id.toString()) navigate(`/`);
        refetch();
      },
      [refetch, navigate]
    );

    const onlineUsersListener = useCallback((data) => {
      dispatch(setOnlineMembers(data));
    }, []);

    const chatOnlineUsersListener = useCallback(({ chatOnlineMembers }) => {

      dispatch(setChatOnlineMembers(chatOnlineMembers));
    }, []);

    const eventHandler = {
      [NEW_MESSAGE_ALERT]: newMessagesAlert,
      [NEW_REQUEST]: newRequestAlert,
      [START_TYPING]: startTypingListner,
      [STOP_TYPING]: stopTypingListner,
      [REFETCH_CHATS]: refetchListner,
      [MEMBER_REMOVED]: refetchNewMembers,
      [ONLINE_USERS]: onlineUsersListener,
      [CHAT_ONLINE_USERS]: chatOnlineUsersListener,
    };

    useSocketEvents(socket, eventHandler);

    return (
      <>
        <Title />
        <main>
          <Navbar setnav={setnav} curnav={curnav} navbarref={navbarref} />

          {curnav === "chats" && (
            <AllChats
              curnav={curnav}
              allChats={allChats}
              navbarref={navbarref}
              isLoading={isLoading}
              data={data}
              refetch={refetch}
              setSearch={setSearch}
              search={search}
            />
          )}

          {curnav === "calls" && (
            <AllChats curnav={curnav} allChats={allChats} />
          )}

          {curnav === "Nox Verse" && (
            <NoxVerse curnav={curnav} allChats={allChats} />
          )}

          <WrapComp chatid={chatid} allChats={allChats} navbarref={navbarref} />
        </main>
      </>
    );
  };
};

export default AppLayout;
