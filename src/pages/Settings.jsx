import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowBack, CameraAlt, Save } from "@mui/icons-material";
import { useAsyncMutation } from "../hooks/hook";
import {
  useUpdateProfileMutation,
  useUpdateProfilePictureMutation,
} from "../redux/api/api";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";
import {
  useName,
  useUserName,
  useBio,
} from "../hooks/InputValidator";
import ImageViewer from "../components/common/ImageViewer";

/**
 * Settings/Profile Page (iMessage style)
 */
const Settings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isDark } = useTheme();
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewingImage, setViewingImage] = useState("");

  const [file, setFile] = useState("");
  const [image, setImage] = useState(user?.avatar?.url || user?.avatar || "");

  const { curname, setname, nameFlag, nameErr } = useName(user?.name || "");
  const { user: username, setuser, userFlag, userErr } = useUserName(user?.username || "");
  const { bio, setbio, bioFlag, bioErr } = useBio(user?.bio || "");

  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const hasProfileChanges = 
      curname !== user?.name ||
      username !== user?.username ||
      bio !== user?.bio;
    
    setHasChanges(hasProfileChanges || file);
  }, [curname, username, bio, file, user]);

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

  const [updateProfileMutation] = useAsyncMutation(useUpdateProfileMutation);
  const [updateProfilePictureMutation] = useAsyncMutation(useUpdateProfilePictureMutation);

  const handleSave = async () => {
    if (nameFlag || userFlag || bioFlag) {
      return toast.error("Please fix all errors before saving");
    }

    try {
      // Update profile picture if changed
      if (file) {
        const formdata = new FormData();
        formdata.append("avatar", file);
        await updateProfilePictureMutation("Updating profile picture...", formdata);
      }

      // Update profile data if changed
      if (curname !== user?.name || username !== user?.username || bio !== user?.bio) {
        await updateProfileMutation("Updating profile...", {
          name: curname,
          username: username,
          bio: bio,
        });
      }

      toast.success("Profile updated successfully!");
      setHasChanges(false);
      setFile("");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageClick = () => {
    setViewingImage(image);
    setShowImageViewer(true);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <ArrowBack />
          </button>
          <h1 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h1>
          <button
            onClick={handleSave}
            disabled={!hasChanges || nameFlag || userFlag || bioFlag}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasChanges && !nameFlag && !userFlag && !bioFlag
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={image || "/avatar.jpeg"}
              alt={user?.name || "Profile"}
              className="w-32 h-32 rounded-full object-cover border-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                borderColor: isDark ? "#374151" : "#e5e7eb",
              }}
              onClick={handleImageClick}
            />
            <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
              <CameraAlt className="w-5 h-5" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className={`mt-4 text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Tap to view full size
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Name
            </label>
            <input
              type="text"
              value={curname}
              onChange={(e) => setname(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter your name"
            />
            {nameErr && (
              <p className="mt-1 text-sm text-red-500">{nameErr}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setuser(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter username"
            />
            {userErr && (
              <p className="mt-1 text-sm text-red-500">{userErr}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setbio(e.target.value)}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                isDark
                  ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Tell us about yourself"
            />
            {bioErr && (
              <p className="mt-1 text-sm text-red-500">{bioErr}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? 'border-gray-600 bg-gray-800 text-gray-400'
                  : 'border-gray-300 bg-gray-100 text-gray-500'
              } cursor-not-allowed`}
            />
            <p className={`mt-1 text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {showImageViewer && (
        <ImageViewer
          imageUrl={viewingImage}
          alt={user?.name || "Profile"}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </div>
  );
};

export default Settings;

