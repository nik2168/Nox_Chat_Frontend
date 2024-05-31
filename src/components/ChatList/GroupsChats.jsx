import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { transformImage } from "../../lib/features";
import { Delete } from "@mui/icons-material";
import { motion } from "framer-motion";



const GroupChats = ({ allChats, chat, navbarref, handleDeleteChatOpen, index, profilewindow, setCurChatId }) => {
  const { allChatsIsTyping } = useSelector((state) => state.chat); // Cur User

  const { newMessageAlert } = useSelector((state) => state.chat);
  const { typing } = useSelector((state) => state.chat);

  const { _id, name, avatar, groupChat } = chat;

  const msgAlert = newMessageAlert?.find(
    (i) => i.chatid.toString() === _id.toString()
  );
  const notificationCount = msgAlert?.count || 0;
  const messageAlert = msgAlert?.message || "No new message";
  let msg = messageAlert?.content?.slice(0, 18) || [];
  if (msg.length === 18) msg += "...";

  let startTyping = false;
  let whoIsTyping;
  if (_id.toString() === allChatsIsTyping.typingChatid.toString()) {
    whoIsTyping = allChatsIsTyping.name;
    startTyping = allChatsIsTyping.isTyping;
  }

  if (!groupChat) return;

  

  return (
    <>
      <div
    
        // onContextMenu={(e) => handleDeleteChatOpen(e, _id, groupChat)}
        className="person-div"
      >
        <button value={_id} className="person-dp" onClick={(e) => {
           profilewindow.current.classList.add("active");
           allChats.current.classList.add("lightblur");
           setCurChatId(e.currentTarget.value);
        }}>
          <div className="groupbg1"> </div>
          <div className="groupbg2"></div>
          <img
            src={
              transformImage(avatar) ||
              "https://res.cloudinary.com/dki615p7n/image/upload/v1715486888/default_avatar_tvgr8w.jpg"
            }
            alt=""
            className="group-image"
            style={{ height: "58px", width: "58px" }}
          />
        </button>
        <Link
          to={`/chat/${_id}`}
          className="person-details"
          onClick={() => {
            navbarref.current.style.zIndex = "1";
            allChats.current.style.zIndex = "0";
          }}
        >
          <h5>{name}</h5>
          {startTyping ? (
            <span style={{ color: "yellowgreen" }}>
              {groupChat && `${whoIsTyping} : `}typing ...
            </span>
          ) : (
            <span>{msg}</span>
          )}
        </Link>
        <span className="person-time">
          {moment(messageAlert?.sender?.createdAt).fromNow()}
        </span>
        {notificationCount !== 0 && (
          <span className="person-notification-count">{notificationCount}</span>
        )}
      </div>
    </>
  );
};

export default GroupChats;
