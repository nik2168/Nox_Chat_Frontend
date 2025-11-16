import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowBack, CameraAlt, Delete, ExitToApp, Add, PersonRemove } from "@mui/icons-material";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useDeleteChatMutation,
  useLazyExitGroupQuery,
  useRemoveMembersMutation,
  useUpdateGroupInfoMutation,
} from "../../redux/api/api";
import AddMembersModal from "./AddMembersModal";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";
import ImageViewer from "../common/ImageViewer";

/**
 * Unified Chat Profile Component (iMessage style)
 * Merges chat settings and single chat info into one screen
 */
const ChatProfile = ({ chat, chatId, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { onlineMembers } = useSelector((state) => state.chat);
  const { isDark } = useTheme();

  const isGroupChat = chat?.groupChat || false;
  const otherMember = chat?.members?.find(
    (m) => (m._id?.toString() || m.toString()) !== user?._id?.toString()
  );
  const chatName = isGroupChat ? chat?.name : otherMember?.name || "Chat";
  const avatar = isGroupChat 
    ? chat?.avatar?.url || chat?.avatar 
    : otherMember?.avatar?.url || otherMember?.avatar;

  const isAdmin = isGroupChat && user?._id?.toString() === chat?.creator?.toString();
  const members = chat?.members || [];

  const [file, setFile] = useState("");
  const [curimage, setImage] = useState(avatar);
  const [curname, setname] = useState(chatName);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  useEffect(() => {
    setname(chatName);
    setImage(avatar);
  }, [chat, chatName, avatar]);

  // Update Group Info
  const [updateGroupMutation] = useAsyncMutation(useUpdateGroupInfoMutation);
  const updateGroupInfoHandler = async () => {
    if (!isGroupChat || !isEditing) return;

    const formdata = new FormData();
    formdata.append("name", curname);
    if (file) formdata.append("avatar", file);

    await updateGroupMutation("Updating group info...", { formdata, chatId });
    setIsEditing(false);
    toast.success("Group updated successfully");
  };

  // Remove Member
  const [removeMemberMutation] = useAsyncMutation(useRemoveMembersMutation);
  const removeMemberHandler = async (memberId) => {
    const member = members.find((m) => m._id?.toString() === memberId);
    if (!member) return;

    const data = {
      chatId,
      remove_members: [memberId],
    };

    await removeMemberMutation(`Removing ${member.name} from group`, data);
  };

  // Exit Group
  const [exitGroupQuery] = useLazyExitGroupQuery();
  const exitGroupHandler = async () => {
    try {
      const res = await exitGroupQuery(chatId);
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        onClose();
        navigate("/");
      } else {
        toast.error(res?.error?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // Delete Chat
  const [deleteChatMutation] = useAsyncMutation(useDeleteChatMutation);
  const deleteChatHandler = async () => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      await deleteChatMutation("Deleting chat...", chatId);
      onClose();
      navigate("/");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (imageUrl) => {
    setViewingImage(imageUrl);
    setShowImageViewer(true);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'dark' : ''}`}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className={`w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <ArrowBack className={isDark ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {isGroupChat ? "Group Info" : "Chat Details"}
          </h2>
          {isGroupChat && isAdmin && (
            <button
              onClick={() => {
                if (isEditing) {
                  updateGroupInfoHandler();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                isEditing
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : isDark
                  ? 'text-blue-400 hover:bg-gray-800'
                  : 'text-blue-500 hover:bg-gray-100'
              }`}
            >
              {isEditing ? "Save" : "Edit"}
            </button>
          )}
          {!isGroupChat && (
            <div className="w-10" /> // Spacer
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Avatar Section */}
          <div className="flex flex-col items-center py-6 px-4">
            <div className="relative">
              <img
                src={curimage || "/avatar.jpeg"}
                alt={chatName}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleImageClick(curimage || "/avatar.jpeg")}
              />
              {isEditing && isGroupChat && (
                <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                  <CameraAlt className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {isEditing && isGroupChat ? (
              <input
                type="text"
                value={curname}
                onChange={(e) => setname(e.target.value)}
                className={`mt-4 px-4 py-2 rounded-lg text-center text-lg font-semibold ${
                  isDark
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Group name"
              />
            ) : (
              <h3 className={`mt-4 text-xl font-semibold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {chatName}
              </h3>
            )}
            {!isGroupChat && otherMember && (
              <div className="mt-1 flex items-center gap-2">
                {onlineMembers?.includes(otherMember._id?.toString()) && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                )}
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {onlineMembers?.includes(otherMember._id?.toString()) ? "online" : "offline"}
                </p>
              </div>
            )}
          </div>

          {/* Members Section (Group Chat) */}
          {isGroupChat && (
            <div className={`px-4 py-2 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Members ({members.length})
                </h4>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddMembers(true)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-gray-100 text-blue-500'
                    }`}
                  >
                    <Add />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar?.url || member.avatar || "/avatar.jpeg"}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleImageClick(member.avatar?.url || member.avatar || "/avatar.jpeg")}
                      />
                      <div>
                        <p className={`font-medium ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {member.name}
                          {member._id?.toString() === user?._id?.toString() && (
                            <span className={`ml-2 text-xs ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              (You)
                            </span>
                          )}
                        </p>
                        {onlineMembers?.includes(member._id?.toString()) && (
                          <p className={`text-xs ${
                            isDark ? 'text-green-400' : 'text-green-600'
                          }`}>
                            online
                          </p>
                        )}
                      </div>
                    </div>
                    {isAdmin && member._id?.toString() !== user?._id?.toString() && (
                      <button
                        onClick={() => removeMemberHandler(member._id)}
                        className={`p-2 rounded-full transition-colors ${
                          isDark ? 'hover:bg-gray-700 text-red-400' : 'hover:bg-gray-100 text-red-500'
                        }`}
                      >
                        <PersonRemove />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className={`px-4 py-4 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          } space-y-2`}>
            {isGroupChat && (
              <button
                onClick={exitGroupHandler}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-800 text-red-400'
                    : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <ExitToApp />
                <span className="font-medium">Exit Group</span>
              </button>
            )}
            {isGroupChat && isAdmin && (
              <button
                onClick={deleteChatHandler}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-800 text-red-400'
                    : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <Delete />
                <span className="font-medium">Delete Group</span>
              </button>
            )}
            {!isGroupChat && (
              <button
                onClick={deleteChatHandler}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-800 text-red-400'
                    : 'hover:bg-red-50 text-red-600'
                }`}
              >
                <Delete />
                <span className="font-medium">Delete Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Members Modal */}
      {showAddMembers && (
        <AddMembersModal
          chatId={chatId}
          members={members}
          onClose={() => setShowAddMembers(false)}
        />
      )}

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt={chatName}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default ChatProfile;

