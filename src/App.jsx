import React, { useState } from "react";
import { Container, Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Upload from "./Upload/Index";
import MapViewer from "./MapViewer/Index";
import { ToastContainer } from "react-toastify";
import { GameState } from "./SocketContext/Index";
import LogIn from "./LogIn/Index"; // Import your login component
import { MapTokenProvider } from "./Map&TokenContext/Index.jsx"; // Import your context
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [open, setOpen] = useState(false);
  const [mapType, setMapType] = useState("image");
  const [mapSrc, setMapSrc] = useState("/FeyRuinsAutumn.jpg");
  const [tokenSrc, setTokenSrc] = useState("/Darius.jpeg");

  // New state to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${mapSrc})`,
    backgroundSize: "100%",
    backgroundPosition: "center",
    filter: "blur(30px)",
    zIndex: -10,
  };

  // Function to handle login success
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <GameState>
      <MapTokenProvider>
        {isLoggedIn ? (
          <Container maxWidth="false" disableGutters>
            <Box sx={{ position: "relative", minHeight: "100vh" }}>
              <div style={backgroundStyle}></div>
              <Fab
                color="primary"
                aria-label="add"
                sx={{
                  position: "fixed",
                  bottom: 75,
                  right: 75,
                }}
                onClick={handleOpen}
              >
                <AddIcon />
              </Fab>
              <Upload open={open} handleClose={handleClose} />
              <MapViewer type={mapType} src={mapSrc} token={tokenSrc} />
            </Box>
          </Container>
        ) : (
          <>
            <LogIn login={handleLogin} />
            <ToastContainer />
          </>
        )}
      </MapTokenProvider>
    </GameState>
  );
}

export default App;
