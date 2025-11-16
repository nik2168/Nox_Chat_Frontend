import React, { useEffect, useRef } from "react";
import { Close, CheckCircle, Cancel } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { useFetchRequestsQuery, useRequestResponseMutation } from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { resetNotification } from "../../redux/reducer/chat";
import { useTheme } from "../../contexts/ThemeContext";
import toast from "react-hot-toast";

/**
 * Notifications Panel Component (iMessage style)
 */
const NotificationsPanel = ({ onClose }) => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { notificationCount } = useSelector((state) => state.chat);

  const { data, isError, error, isLoading, refetch } = useFetchRequestsQuery();
  useErrors([{ isError, error }]);

  useEffect(() => {
    refetch();
  }, [notificationCount, refetch]);

  const [acceptRequestMutation] = useAsyncMutation(useRequestResponseMutation);

  const handleRequestResponse = async (requestId, accept) => {
    const data = {
      requestId,
      accept,
    };
    await acceptRequestMutation(
      `${accept ? "Accepting" : "Rejecting"} friend request...`,
      data
    );
    refetch();
    dispatch(resetNotification());
    if (accept) {
      toast.success("Friend request accepted!");
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
      <div className={`w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Notifications
            {notificationCount > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                isDark ? 'bg-blue-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {notificationCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Close />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : !data?.notifications || data.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No notifications
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.notifications.map(({ _id, sender }) => (
                <div
                  key={_id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                      src={sender?.avatar?.url || sender?.avatar || "/avatar.jpeg"}
                      alt={sender?.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {sender?.name}
                      </p>
                      <p className={`text-sm truncate ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        wants to be your friend
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRequestResponse(_id, false)}
                      className={`p-2 rounded-full transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-red-400'
                          : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <Cancel />
                    </button>
                    <button
                      onClick={() => handleRequestResponse(_id, true)}
                      className={`p-2 rounded-full transition-colors ${
                        isDark
                          ? 'hover:bg-gray-700 text-green-400'
                          : 'hover:bg-green-50 text-green-500'
                      }`}
                    >
                      <CheckCircle />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;

