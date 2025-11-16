import {
  AudioFile,
  DocumentScannerRounded as DocumentIcon,
  PhotoAlbumRounded as PhotoIcon,
  VideoCameraBackRounded as VideoIcon,
  PollRounded,
} from "@mui/icons-material";
import React from "react";
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "../../redux/api/api";

const ChatFilesMenu = ({ chat, chatid, onPollClick }) => {
  const [sendAttachments] = useSendAttachmentsMutation();

  const fileChangeHandler = async (e, key) => {
    if (key.toString() === "Poll") {
      if (onPollClick) {
        onPollClick();
      }
      return;
    }

    const files = Array.from(e.target.files);

    if (files.length <= 0) return;
    if (files.length > 5)
      return toast.error(`You can only send 5 ${key} at a time`);

    const toastId = toast.loading(`Sending ${key}...`);
    if (chat?.current) {
      chat.current.classList.remove("active-files");
    }

    try {
      const formdata = new FormData();
      formdata.append("chatId", chatid);
      files.forEach((file) => formdata.append("files", file));

      const res = await sendAttachments(formdata);

      if (res?.data) {
        toast.success(`${key} send successfully !`, { id: toastId });
      } else {
        console.log(res?.error);
        toast.error(`failed while sending ${key}`, { id: toastId });
      }
    } catch (err) {
      toast.error(err?.data?.message, { id: toastId });
    }
  };

  return (
    <>
      <article className="chat-files fixed bottom-20 left-1/2 transform -translate-x-1/2 
                          bg-gray-800 dark:bg-gray-900 rounded-2xl p-4 shadow-2xl 
                          flex gap-4 z-50 hidden">
        <div className="chat-file poll flex flex-col items-center gap-2 cursor-pointer 
                        hover:bg-gray-700 rounded-lg p-3 transition-colors" 
             onClick={() => {
               if (onPollClick) {
                 onPollClick();
               }
               if (chat?.current) {
                 chat.current.classList.remove("active-files");
               }
             }}>
          <PollRounded className="text-white text-3xl" />
          <span className="text-white text-sm">Poll</span>
        </div>

        <label className="chat-file photos flex flex-col items-center gap-2 cursor-pointer 
                        hover:bg-gray-700 rounded-lg p-3 transition-colors">
          <PhotoIcon className="text-white text-3xl" />
          <span className="text-white text-sm">Photos</span>
          <input
            type="file"
            id="photos"
            multiple
            accept="image/png, image/jpeg, image/gif"
            onChange={(e) => fileChangeHandler(e, "Images")}
            className="hidden"
          />
        </label>

        <label className="chat-file videos flex flex-col items-center gap-2 cursor-pointer 
                        hover:bg-gray-700 rounded-lg p-3 transition-colors">
          <VideoIcon className="text-white text-3xl" />
          <span className="text-white text-sm">Videos</span>
          <input
            type="file"
            id="videos"
            multiple
            accept="video/mp4, video/webm, video/ogg"
            onChange={(e) => fileChangeHandler(e, "Videos")}
            className="hidden"
          />
        </label>

        <label className="chat-file documents flex flex-col items-center gap-2 cursor-pointer 
                        hover:bg-gray-700 rounded-lg p-3 transition-colors">
          <DocumentIcon className="text-white text-3xl" />
          <span className="text-white text-sm">File</span>
          <input
            type="file"
            id="documents"
            multiple
            accept="*"
            onChange={(e) => fileChangeHandler(e, "Files")}
            className="hidden"
          />
        </label>

        <label className="chat-file audio flex flex-col items-center gap-2 cursor-pointer 
                        hover:bg-gray-700 rounded-lg p-3 transition-colors">
          <AudioFile className="text-white text-3xl" />
          <span className="text-white text-sm">Audio</span>
          <input
            type="file"
            id="audio"
            multiple
            accept="audio/mpeg, audio/wav"
            onChange={(e) => fileChangeHandler(e, "Audios")}
            className="hidden"
          />
        </label>
      </article>
    </>
  );
};

export default ChatFilesMenu;
