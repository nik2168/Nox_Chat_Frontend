import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getSocket } from "../../socket";
import { ONLINE_USERS } from "../../constants/events";
import { setOnlineMembers } from "../../redux/reducer/chat";
import { useSocketEvents } from "../../hooks/hook";

/**
 * Global Socket Listeners Component
 * Handles app-wide socket events like ONLINE_USERS
 */
const GlobalSocketListeners = () => {
  const dispatch = useDispatch();
  const socket = getSocket();

  // Online users listener - updates overall online status
  const onlineUsersListener = useCallback((data) => {
    dispatch(setOnlineMembers(data));
  }, [dispatch]);

  // Setup socket event handlers
  const eventHandler = {
    [ONLINE_USERS]: onlineUsersListener,
  };

  useSocketEvents(socket, eventHandler);

  return null; // This component doesn't render anything
};

export default GlobalSocketListeners;

