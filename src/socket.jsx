import { createContext, useContext, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import { server } from "./constants/config";

const SocketContext = createContext();

const getSocket = () => useContext(SocketContext);

const SocketProvider = ({ children }) => {
  // Get token from localStorage for Safari compatibility
  const token = localStorage.getItem("chatapp-token");
  
  const socket = useMemo(() => 
    io.connect(server, { 
      withCredentials: true,
      auth: {
        token: token, // Send token in auth for Safari
      },
    }), 
  [token]);
  
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};


// const SocketProvider = ({ children }) => {

//   const [socket, setSocket] = useState(null)
    
// useEffect(() => {
//     const socket = io("http://localhost:3333", { withCredentials: true });

//     setSocket(socket);


//     // return () => socket.close();
 
// }, []);

//  console.log("OUter Socket :", socket)

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };

export { SocketProvider, getSocket };
