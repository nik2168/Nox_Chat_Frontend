import moment from "moment";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import Poll from "./Poll";

// Format read timestamp in iMessage style
const formatReadTime = (timestamp) => {
  if (!timestamp) return "";
  return moment(timestamp).format("h:mm A");
};

const Messages = ({
  chat,
  // allMessages,
  user,
  scrollElement,
  messages,
  groupChat,
  chatId,
}) => {
  const { newGroupAlert } = useSelector((state) => state.chat);
  const { allMessages } = useSelector((state) => state.chat);

  const autoScrollDiv = useRef();

  // const lastSeenTime = otherMember?.lastSeen;
  // let lastChatSeenTime;
  // for(let i = 0; i < lastChatOnlineArray?.length; i++){
  //   let memObj = lastChatOnlineArray[i];
  //   if(memObj?.memberId?.toString() !== user?._id?.toString()){
  //     console.log("here : ",memObj?.lastChatOnline)
  //     lastChatSeenTime = memObj?.lastChatOnline
  //   }
  // }

  useEffect(() => {
    if (autoScrollDiv.current)
      autoScrollDiv.current.scrollIntoView({ behaviour: "smooth" });
  }, []);

  return (
    <ul
      className="chat-texts"
      ref={scrollElement}
      onClick={() => {
        chat.current.classList.remove("active-files");
        chat.current.classList.remove("activesettings");
      }}
    >
      {newGroupAlert?.isNewAlert && <p>{newGroupAlert.message}</p>}

      {allMessages?.map((i, index) => {
        const {
          _id,
          content,
          isAlert,
          isPoll,
          options,
          attachments,
          sender,
          tempId,
          createdAt,
          status,
          readAt,
        } = i;

        const timeAgo = moment(i?.createdAt).fromNow();
        const samesender = user?._id?.toString() === sender?._id?.toString();

        // Find the last message sent by current user
        const myMessages = allMessages.filter(
          (msg) => msg.sender?._id?.toString() === user?._id?.toString()
        );
        const lastMyMessage = myMessages[myMessages.length - 1];
        const isLastMessage = _id === lastMyMessage?._id && _id != null;

        // Determine message status text (iMessage style) - only show on last message
        const getStatusText = () => {
          if (!samesender || !isLastMessage) return null;
          
          if (status === "seen") {
            const readTime = readAt ? formatReadTime(readAt) : "";
            return `Read ${readTime}`;
          } else if (status === "online") {
            return "Delivered";
          }
          return null; // "send" status doesn't show anything (like iMessage)
        };

        const statusText = getStatusText();

        // const isOnline = !samesender && onlineMembers.includes(sender._id.toString());
        // const isInChatOnline = !samesender && onlineChatMembers.includes(sender._id.toString());
        // console.log(isOnline, isInChatOnline);

        {
          // return <Poll question={content} options={options} />;

          if (isAlert) {
            return (
                <div key={_id} className="chatmessagesalert">
                  <div className="messagealertinnerdiv">
                    <p>{content}</p>
                  </div>
                </div>
            );
          }

        else if (isPoll) {
            return (
                <Poll
                  chatId={chatId}
                  user={user}
                  samesender={samesender}
                  question={content}
                  options={options}
                  tempId={tempId}
                />
            );
          }

          return !samesender ? (
            <>
              {content && (
                <li key={_id} className="textsinboxOuterDiv">
                  <div className="textsinboxdiv">
                    {groupChat && <p className="textsender">{sender.name}</p>}

                    <p className="textsinboxp">{content}</p>
                    <p className="textsinboxtimeStamps">{timeAgo}</p>
                  </div>
                </li>
              )}

              {attachments?.length > 0 &&
                attachments?.map((i, idx) => {
                  const url = i.url;
                  const file = fileFormat(url);

                  return (
                    <li key={_id} className="inboxAttachmentsOuterdiv">
                      <div className="inboxAttachments">
                        {groupChat && (
                          <p className="textsender">{sender.name}</p>
                        )}
                        <Box>
                          <a href={url} target="_blank" download>
                            {RenderAttachment(file, url)}
                          </a>
                          {file === "file" && (
                            <p className="textsinboxp">Attachment</p>
                          )}
                        </Box>
                        <p className="textsinboxtimeStamps">{timeAgo}</p>
                      </div>
                    </li>
                  );
                })}
            </>
          ) : (
            <>
              {content && (
                <li key={_id} className="textssentOuterDiv">
                  <div className="textssentdiv">
                    <p className="textssentp">{content}</p>
                    <div className="inboxtimetickdiv">
                      <p className="textssenttimeStamps">{timeAgo}</p>
                    </div>
                    {/* iMessage-style Read Receipt */}
                    {statusText && (
                      <p 
                        style={{ 
                          fontSize: "0.7rem", 
                          color: status === "seen" ? "#007AFF" : "#9ca3af", 
                          marginTop: "0.25rem",
                          textAlign: "right",
                          fontWeight: status === "seen" ? "500" : "400"
                        }}
                      >
                        {statusText}
                      </p>
                    )}
                  </div>
                </li>
              )}
              {attachments?.length > 0 &&
                attachments?.map((i, idx) => {
                  const url = i.url;
                  const file = fileFormat(url);

                  return (
                    <li key={_id} className="sentAttachmentsOuterdiv">
                      <div className="sentAttachments">
                        <Box>
                          <a href={url} target="_blank" download>
                            {RenderAttachment(file, url)}
                          </a>
                        </Box>
                        <p className="textssenttimeStamps">{timeAgo}</p>
                        {/* iMessage-style Read Receipt for attachments */}
                        {statusText && (
                          <p 
                            style={{ 
                              fontSize: "0.7rem", 
                              color: status === "seen" ? "#007AFF" : "#9ca3af", 
                              marginTop: "0.25rem",
                              textAlign: "right",
                              fontWeight: status === "seen" ? "500" : "400"
                            }}
                          >
                            {statusText}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
            </>
          );
        }
      })}

      <div ref={autoScrollDiv}></div>
    </ul>
  );
};

export default Messages;
