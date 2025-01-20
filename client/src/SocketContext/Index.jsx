import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase/firebase"; 
import { getDocs, query, where} from "firebase/firestore";
import { usersCollection } from "../Firebase/firebase"; // Import Firestore DB

const SocketContext = createContext();

export const GameState = ({ children, isLoggedIn }) => {
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState(null);

  // Handle Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
      
        const q = query(usersCollection, where("email", "==", user.email));

        try {
          // Fetch the user's data from Firestore
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Assuming the first document corresponds to the authenticated user
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();

          

            setUserData(data);  // Set the user data
          } else {
            console.log("No user data found in Firestore for email:", user.email);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }
      } else {
        // No user is signed in
        setUserData(null);
        console.log("No user is signed in");
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // Establish WebSocket connection when userName, role, and email are set
  useEffect(() => {
    if (userData?.role && userData?.userName && userData?.email && isLoggedIn) {
      console.log("Establishing WebSocket connection");
  
      const { userName, role, email } = userData;
  
      const newSocket = io(`${import.meta.env.VITE_SOCKET_SERVER}`, {
        query: { username: userName, role: role, email: email },
      });
  
      // Add null checks to avoid errors
      if (newSocket) {
        newSocket.on("connect", () => {
          console.log("Connected to WebSocket server");
  
          // Emit and listen for messages
          newSocket.emit("message", "Hello from client");
          newSocket.on("message", (message) => {
            console.log("WebSocket message received:", message);
          });
        });
  
        setSocket(newSocket);
      } else {
        console.error("Failed to establish WebSocket connection");
      }
  
      return () => {
        if (newSocket) {
          console.log("Closing WebSocket connection");
          newSocket.close();
        }
      };
    }
  }, [isLoggedIn, userData]);
  return (
    <SocketContext.Provider value={{ socket, userData }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
