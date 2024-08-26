import { Message } from '@mui/icons-material';
import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const GameState = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log('code is running');
    const newSocket = new WebSocket('ws://localhost:8080');
    newSocket.onmessage = (message) => {
      console.log('WebSocket message received:', message);
      // handle the message if needed
    };
  
    newSocket.onopen = function () {
      console.log('you are connected');
    };
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
