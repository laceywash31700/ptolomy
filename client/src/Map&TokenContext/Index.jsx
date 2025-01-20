import { createContext, useState, useContext, useEffect } from "react";
import { mapsCollection, tokensCollection } from "../Firebase/firebase";
import { onSnapshot } from "firebase/firestore";

// Create the context
const MapTokenContext = createContext();

// Create the provider component
export const MapTokenProvider = ({ children }) => {
  const [maps, setMaps] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [src, setSrc] = useState("/FeyRuinsAutumn.jpg");
  const [tokenSrc, setTokenSrc] = useState("/Darius.jpeg");

  useEffect(() => {
    // Set up the real-time listener for maps
    const unsubscribeMaps = onSnapshot(mapsCollection, (snapshot) => {
      const mapsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // console.log("Updated maps data:", mapsData);
      setMaps(mapsData);
    });

    // Set up the real-time listener for tokens
    const unsubscribeTokens = onSnapshot(tokensCollection, (snapshot) => {
      const tokensData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTokens(tokensData);
      // console.log("Updated tokens data:", tokensData);
    });

    // Clean up the listeners on unmount
    return () => {
      unsubscribeMaps();
      unsubscribeTokens();
    };
  }, []);

  return (
    <MapTokenContext.Provider
      value={{ maps, setMaps, tokens, setTokens, src, setSrc }}
    >
      {children}
    </MapTokenContext.Provider>
  );
};

// Custom hook to use the MapTokenContext
export const useMapTokenContext = () => useContext(MapTokenContext);
