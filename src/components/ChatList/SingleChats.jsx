import { Skeleton } from "@mui/material";
import moment from "moment";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getOrSaveFromStorage } from "../../lib/features";
import { NEW_MESSAGE_ALERT } from "../../constants/events";
import GroupChats from "./GroupsChats";
import { motion } from "framer-motion";
import { useGetLastMessageTimeQuery } from "../../redux/api/api";
import { useErrors } from "../../hooks/hook";


const SingleChats = ({
  chat,
  allChats,
  navbarref,
  profilewindow,
  setCurChatId,
  index
}) => {
  
  const { allChatsIsTyping } = useSelector((state) => state.chat); // Cur User
    const { onlineMembers } = useSelector((state) => state.chat);

  const { newMessageAlert } = useSelector((state) => state.chat);
  const { typing } = useSelector((state) => state.chat);

  useEffect(() => {
    getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessageAlert });
  }, [newMessageAlert]);

  const handleDeleteChatOpen = (e, _id, groupChat) => {
    e.preventDefault();
    console.log(_id, groupChat);
  };


        const { _id, name, avatar, creator, members, groupChat } = chat;

        const {isLoading, isError, error, data, refetch} = useGetLastMessageTimeQuery(_id)
        const lastMessageTime = data?.lastMessage?.createdAt
        const lastMessageContent = data?.lastMessage?.content || "...";
        let lastMsgData = "..."
                if(lastMessageTime)  lastMsgData = moment(data?.lastMessage?.createdAt).fromNow();
        useErrors([{isError, error}])


              let isOnline = false;
              if (!groupChat) {
                const otherMember = members[0]?._id;
                if (onlineMembers.includes(otherMember.toString()))
                  isOnline = true;
              }

              const msgAlert = newMessageAlert?.find(
                (i) => i.chatid.toString() === _id.toString()
              );
              const notificationCount = msgAlert?.count || 0;
              const messageAlert = msgAlert?.message || "No new message";
              let msg = messageAlert?.content?.slice(0, 18) || lastMessageContent;
              if (msg.length === 18) msg += "...";

              let startTyping = false;
              if (_id.toString() === allChatsIsTyping.typingChatid.toString())
                startTyping = allChatsIsTyping.isTyping;


  return (
    <>
     {groupChat ? (
            <GroupChats
              key={_id}
              chat={chat}
              index={index}
              allChats={allChats}
              navbarref={navbarref}
              handleDeleteChatOpen={handleDeleteChatOpen}
              profilewindow={profilewindow}
              setCurChatId={setCurChatId}
            />
          ) : (
            <div
              onContextMenu={(e) => handleDeleteChatOpen(e, _id, groupChat)}
              className="person-div"
              key={index}
            >
              <button
                className="person-dp"
                value={_id}
                onClick={(e) => {
                  profilewindow.current.classList.add("active");
                  allChats.current.classList.add("lightblur");
                  setCurChatId(e.currentTarget.value)
                }}
              >
                <img
                  src={
                    avatar ||
                    "https://res.cloudinary.com/dki615p7n/image/upload/v1715486888/default_avatar_tvgr8w.jpg"
                  }
                  alt=""
                  className="person-image"
                  style={{ height: "70px", width: "70px" }}
                />
                {isOnline && <div className="online"></div>}
              </button>

              <Link
                to={`/chat/${_id}`}
                className="person-details"
                onClick={() => {
                  allChats.current.style.zIndex = "0";
                  navbarref.current.style.zIndex = "1";
                }}
              >
                <h5>{name}</h5>
                {startTyping ? (
                  <span style={{ color: "green" }}>typing ...</span>
                ) : (
                  <span>{msg}</span>
                )}
              </Link>

             {isLoading ? <Skeleton/> : (<span className="person-time">
                {lastMsgData}
              </span>)
              }
              
              {notificationCount !== 0 && (
                <span className="person-notification-count">
                  {notificationCount}
                </span>
              )}
            </div>
          ) }

    </>
  );
};

export default SingleChats;
