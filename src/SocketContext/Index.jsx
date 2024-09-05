import { io } from "socket.io-client";
import React, { createContext, useContext, useEffect, useState } from "react";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const GameState = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (role && userName) {
      console.log("Establishing WebSocket connection");
      const newSocket = io(`ws://localhost:8080`, {
        query: { username: userName, role: role },
      });

      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");

        // Example of emitting a message
        newSocket.emit("message", "Hello from client");

        // Example of handling a message from the server
        newSocket.on("message", (message) => {
          console.log("WebSocket message received:", message);
        });
      });

      setSocket(newSocket);

      return () => newSocket.close();
    }
  }, [role, userName]);

  return (
    <SocketContext.Provider value={{ socket, setRole, setUserName }}>
      {children}
    </SocketContext.Provider>
  );
};
