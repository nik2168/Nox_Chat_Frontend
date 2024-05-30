import moment from "moment";
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { Box } from "@mui/material";
import {motion} from "framer-motion"

const Messages = ({
  chat,
  allMessages,
  user,
  scrollElement,
  chatid,
  messages,
  groupChat,
}) => {
  const { newGroupAlert } = useSelector((state) => state.chat);

  const autoScrollDiv = useRef();

  useEffect(() => {
    if (autoScrollDiv.current)
      autoScrollDiv.current.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

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
        const { _id, content, isAlert, attachments, sender, createdAt } = i;
  const timeAgo = moment(createdAt).fromNow();
        const samesender = user?._id.toString() === sender?._id.toString() ;

        {
          return !samesender ? (
            isAlert ? (
              <div key={_id} className="chatmessagesalert">
                <div className="messagealertinnerdiv">
                  <p>{content}</p>
                </div>
              </div>
            ) : (
              <>
                {content && (
                  <li key={index} className="textsinboxOuterDiv">
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
                      <li key={idx} className="inboxAttachmentsOuterdiv">
                        <div className="inboxAttachments">
                          {groupChat && (
                            <p className="textsender">{sender.name}</p>
                          )}
                          <Box >
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
            )
          ) : isAlert ? (
            <div key={index} className="chatmessagesalert">
              <div className="messagealertinnerdiv">
                <p>{content}</p>
              </div>
            </div>
          ) : (
            <>
              {content && (
                <li key={_id} className="textssentOuterDiv">
                  <div className="textssentdiv">
                    <p className="textssentp">{content}</p>
                    <p className="textssenttimeStamps">{timeAgo}</p>
                  </div>
                </li>
              )}
              {attachments?.length > 0 &&
                attachments?.map((i, idx) => {
                  const url = i.url;
                  const file = fileFormat(url);

                  return (
                    <li key={idx} className="sentAttachmentsOuterdiv">
                      <div className="sentAttachments">
                        <Box>
                          <a href={url} target="_blank" download>
                            {RenderAttachment(file, url)}
                          </a>
                        </Box>
                        <p className="textssenttimeStamps">{timeAgo}</p>
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
