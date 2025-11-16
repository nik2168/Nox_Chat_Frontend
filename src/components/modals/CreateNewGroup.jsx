import React, { useRef, useState } from "react";
import { CameraAlt, ArrowBack, Search, AddCircle, RemoveCircle } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useCreateGroupMutation,
  useLazyFetchUserFriendsQuery,
} from "../../redux/api/api";
import {
  removeAllSelectedFriends,
  removeOneSelectedFriend,
  addOneSelectedFriend,
  setAllFriends,
} from "../../redux/reducer/createGroupSlice";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Create New Group Modal (iMessage style)
 */
const CreateNewGroupModal = ({ onClose }) => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { allFriends } = useSelector((state) => state.create);
  const { selectedFriends } = useSelector((state) => state.create);

  const [curimage, setImage] = useState(null);
  const [file, setFile] = useState("");
  const [name, setname] = useState("");
  const [search, setSearch] = useState("");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  const [searchUserFriends] = useLazyFetchUserFriendsQuery("");

  React.useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchUserFriends({ name: search })
        .then(({ data }) => dispatch(setAllFriends(data?.allFriends || [])))
        .catch((e) => console.log(e));
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [search, searchUserFriends, dispatch]);

  const [createGroupMutation, isLoadingCreateGroup] = useAsyncMutation(
    useCreateGroupMutation
  );

  const handleCreateGroup = async () => {
    if (name.length === 0) return toast.error("Please provide a name");
    if (name.length > 15)
      return toast.error("Name must be less than 15 characters!");
    if (!file) return toast.error("Please upload a group image!");
    if (selectedFriends.length === 0)
      return toast.error("Group must have at least 2 members");

    const formdata = new FormData();
    formdata.append("name", name);
    selectedFriends.forEach((friend) => formdata.append("members", friend));
    formdata.append("avatar", file);

    await createGroupMutation(`Creating ${name}...`, formdata);
    onClose();
    dispatch(removeAllSelectedFriends());
    setname("");
    setFile("");
    setImage(null);
    setSearch("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3000000) {
        toast.error("Image size must be less than 3MB");
        return;
      }
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowBack />
          </button>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Create New Group
          </h2>
          <button
            onClick={handleCreateGroup}
            disabled={isLoadingCreateGroup || !name.trim() || !file || selectedFriends.length === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLoadingCreateGroup || !name.trim() || !file || selectedFriends.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Create
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Group Image & Name */}
          <div className="flex flex-col items-center py-6 px-4">
            <div className="relative">
              <img
                src={curimage || "/avatar.jpeg"}
                alt="Group"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setViewingImage(curimage || "/avatar.jpeg");
                  setShowImageViewer(true);
                }}
              />
              <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                <CameraAlt className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Group name"
              maxLength={15}
              className={`mt-4 px-4 py-2 rounded-lg text-center text-lg font-semibold w-full max-w-xs ${
                isDark
                  ? 'bg-gray-800 text-white border-gray-700 placeholder-gray-400'
                  : 'bg-gray-100 text-gray-900 border-gray-300 placeholder-gray-500'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {name.length > 0 && (
              <p className={`mt-1 text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {name.length}/15 characters
              </p>
            )}
          </div>

          {/* Selected Members */}
          {selectedFriends.length > 0 && (
            <div className={`px-4 py-2 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Selected ({selectedFriends.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedFriends.map((friendId) => {
                  const friend = allFriends.find((f) => f._id === friendId);
                  if (!friend) return null;
                  return (
                    <div
                      key={friendId}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <img
                        src={friend.avatar?.url || friend.avatar || "/avatar.jpeg"}
                        alt={friend.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className={`text-sm ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {friend.name}
                      </span>
                      <button
                        onClick={() => dispatch(removeOneSelectedFriend(friendId))}
                        className={`text-xs ${
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <div className={`px-4 py-2 border-t ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="relative mb-4">
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
            <div className="space-y-2">
              {allFriends.length === 0 ? (
                <p className={`text-center py-4 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {search.trim() ? "No friends found" : "Search for friends to add"}
                </p>
              ) : (
                allFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                    }`}
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
                    <button
                      onClick={() => {
                        if (selectedFriends.includes(friend._id)) {
                          dispatch(removeOneSelectedFriend(friend._id));
                        } else {
                          dispatch(addOneSelectedFriend(friend._id));
                        }
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        selectedFriends.includes(friend._id)
                          ? isDark
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          : isDark
                          ? 'hover:bg-gray-700 text-blue-400'
                          : 'hover:bg-blue-50 text-blue-500'
                      }`}
                    >
                      {selectedFriends.includes(friend._id) ? (
                        <RemoveCircle />
                      ) : (
                        <AddCircle />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt="Image"
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default CreateNewGroupModal;
