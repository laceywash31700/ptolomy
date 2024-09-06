import { io } from "socket.io-client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase/firebase"; 
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../Firebase/firebase"; // Import Firestore DB

const SocketContext = createContext();

export const GameState = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);
  const [email, setEmail] = useState(null);
  const [userData, setUserData] = useState(null);

  // Handle Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("email", "==", user.email));

        try {
          // Fetch the user's data from Firestore
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            // Assuming the first document corresponds to the authenticated user
            const userDoc = querySnapshot.docs[0];
            const data = userDoc.data();

            console.log("User data from Firestore:", data);

            setUserData(data);  // Set the user data
            setUserName(data.userName); // Set the userName from Firestore
            setRole(data.role); // Set the role from Firestore
            setEmail(data.email); // Set the email from Firestore
          } else {
            console.log("No user data found in Firestore for email:", user.email);
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
        }
      } else {
        // No user is signed in
        setUserData(null);
        setUserName(null);
        setRole(null);
        setEmail(null);
        console.log("No user is signed in");
      }
    });

    return () => unsubscribe(); // Clean up the listener on component unmount
  }, []);

  // Establish WebSocket connection when userName, role, and email are set
  useEffect(() => {
    if (role && userName && email) {
      console.log("Establishing WebSocket connection");

      const newSocket = io(`http://localhost:8080`, {
        query: { username: userName, role: role, email: email },
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

      return () => newSocket.close(); // Clean up the socket connection on component unmount or change in dependencies
    }
  }, [role, userName, email]);

  return (
    <SocketContext.Provider value={{ socket, userData }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
