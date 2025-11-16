import React, { useRef, useState } from "react";
import { CameraAlt } from "@mui/icons-material";
import {
  useBio,
  useName,
  usePassword,
  useUserName,
} from "../hooks/InputValidator";
import axios from "axios";
import { server } from "../constants/config";
import { useDispatch } from "react-redux";
import { userExists } from "../redux/reducer/authslice";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Modern Login/Signup Page (iMessage style)
 */
const LoginNew = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [file, setFile] = useState("");
  const [image, setImage] = useState("");

  const { curname, setname, nameFlag, nameErr } = useName("");
  const { user, setuser, userFlag, userErr } = useUserName("");
  const { bio, setbio, bioFlag, bioErr } = useBio("");
  const { pass, setpass, passFlag, passErr } = usePassword("");

  const fileInputRef = useRef(null);

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

  const signUpSubmitHandler = async (e) => {
    e.preventDefault();
    if (nameFlag || userFlag || passFlag || bioFlag) {
      return toast.error("Please fill all fields correctly");
    }

    const toastId = toast.loading("Signing Up...");
    setIsLoading(true);

    const formdata = new FormData();
    formdata.append("name", curname);
    formdata.append("username", user);
    formdata.append("password", pass);
    formdata.append("bio", bio);
    if (file) formdata.append("avatar", file);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/signup`,
        formdata,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data?.token) {
        localStorage.setItem("chatapp-token", data.token);
      }

      dispatch(userExists(data?.user));
      toast.success(data?.message || "Signup successful!", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInSubmitHandler = async (e) => {
    e.preventDefault();
    if (userFlag || passFlag) {
      return toast.error("Please fill all fields correctly");
    }

    const toastId = toast.loading("Signing In...");
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/v1/user/login`,
        { username: user, password: pass },
        { withCredentials: true }
      );

      if (data?.token) {
        localStorage.setItem("chatapp-token", data.token);
      }

      dispatch(userExists(data?.user));
      toast.success(data?.message || "Login successful!", { id: toastId });
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          }`}>
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Welcome
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {isSignUp ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Form Card */}
        <div className={`rounded-2xl shadow-xl p-8 ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Toggle */}
          <div className={`flex gap-2 mb-6 rounded-lg p-1 ${
            isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isSignUp
                  ? isDark
                    ? "bg-gray-700 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isSignUp
                  ? isDark
                    ? "bg-gray-700 text-white shadow-sm"
                    : "bg-white text-gray-900 shadow-sm"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Avatar Upload (Sign Up only) */}
          {isSignUp && (
            <div className="mb-6 flex flex-col items-center">
              <div className="relative">
                <img
                  src={image || "/avatar.jpeg"}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                >
                  <CameraAlt className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isSignUp ? signUpSubmitHandler : signInSubmitHandler}>
            {isSignUp && (
              <>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={curname}
                    onChange={(e) => setname(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                               isDark
                                 ? 'border-gray-600 bg-gray-800 text-white'
                                 : 'border-gray-300 bg-white text-gray-900'
                             }`}
                    placeholder="Enter your name"
                  />
                  {nameErr && (
                    <p className="mt-1 text-sm text-red-500">{nameErr}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setbio(e.target.value)}
                    rows={2}
                    className={`w-full px-4 py-2 border rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                               isDark
                                 ? 'border-gray-600 bg-gray-800 text-white'
                                 : 'border-gray-300 bg-white text-gray-900'
                             }`}
                    placeholder="Tell us about yourself"
                  />
                  {bioErr && (
                    <p className="mt-1 text-sm text-red-500">{bioErr}</p>
                  )}
                </div>
              </>
            )}

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Username
              </label>
              <input
                type="text"
                value={user}
                onChange={(e) => setuser(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                           isDark
                             ? 'border-gray-600 bg-gray-800 text-white'
                             : 'border-gray-300 bg-white text-gray-900'
                         }`}
                placeholder="Enter username"
              />
              {userErr && (
                <p className="mt-1 text-sm text-red-500">{userErr}</p>
              )}
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setpass(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                           isDark
                             ? 'border-gray-600 bg-gray-800 text-white'
                             : 'border-gray-300 bg-white text-gray-900'
                         }`}
                placeholder="Enter password"
              />
              {passErr && (
                <p className="mt-1 text-sm text-red-500">{passErr}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold 
                       hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed 
                       transition-colors shadow-lg"
            >
              {isLoading
                ? "Please wait..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <p className={`mt-6 text-center text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Your personal messages are not{" "}
            <strong>end-to-end encrypted</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginNew;

