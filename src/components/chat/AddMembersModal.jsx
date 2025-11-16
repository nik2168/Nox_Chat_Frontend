import React, { useEffect, useState } from "react";
import { ArrowBack, Search, AddCircle, CheckCircle } from "@mui/icons-material";
import toast from "react-hot-toast";
import {
  useAddMembersMutation,
  useLazyFetchUserFriendsQuery
} from "../../redux/api/api";
import { useDispatch, useSelector } from "react-redux";
import { addOneSelectedMember, removeOneSelectedMember, removeAllSelectedMembers, setNonGroupFriends } from "../../redux/reducer/addMembersslice";
import { useAsyncMutation } from "../../hooks/hook";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Add Members Modal (iMessage style)
 */
const AddMembersModal = ({ chatId, members, onClose }) => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { nonGroupFriends } = useSelector((state) => state.addmember);
  const { selectedMembers } = useSelector((state) => state.addmember);

  const [search, setSearch] = useState("");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  const [searchFriends] = useLazyFetchUserFriendsQuery("");

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchFriends({ name: search, chatid: chatId })
        .then(({ data }) => dispatch(setNonGroupFriends(data?.allFriends || [])))
        .catch((e) => console.log(e));
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [search, chatId, searchFriends, dispatch]);

  const [addMembersMutation, isLoadingAddMembersMutation] = useAsyncMutation(
    useAddMembersMutation
  );

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one friend to add to group!");
      return;
    }

    const formdata = {
      chatId: chatId,
      new_members: selectedMembers,
    };

    await addMembersMutation("Adding new members...", formdata);
    dispatch(removeAllSelectedMembers());
    onClose();
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
            onClick={() => {
              dispatch(removeAllSelectedMembers());
              onClose();
            }}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowBack />
          </button>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Add Members
          </h2>
          <button
            onClick={handleAddMembers}
            disabled={selectedMembers.length === 0 || isLoadingAddMembersMutation}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedMembers.length === 0 || isLoadingAddMembersMutation
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Add
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-800 text-white placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>

        {/* Selected Count */}
        {selectedMembers.length > 0 && (
          <div className={`px-4 py-2 border-t ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
          }`}>
            <p className={`text-sm font-medium ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
          {nonGroupFriends?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {search.trim() ? "No friends found" : "Search for friends to add"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {nonGroupFriends?.map((friend) => {
                const isSelected = selectedMembers.includes(friend._id);
                return (
                  <div
                    key={friend._id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        dispatch(removeOneSelectedMember(friend._id));
                      } else {
                        dispatch(addOneSelectedMember(friend._id));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={friend.avatar?.url || friend.avatar || "/avatar.jpeg"}
                        alt={friend.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setViewingImage(friend.avatar?.url || friend.avatar || "/avatar.jpeg");
                          setShowImageViewer(true);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {friend.name}
                        </p>
                        <p className={`text-sm truncate ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : isDark
                        ? 'text-gray-400'
                        : 'text-gray-400'
                    }`}>
                      {isSelected ? <CheckCircle /> : <AddCircle />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt="Profile"
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default AddMembersModal;

