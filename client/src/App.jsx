import React, { useState } from "react";
import { Container, Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Upload from "./Upload/Index.jsx";
import MapViewer from "./MapViewer/Index.jsx";
import { ToastContainer } from "react-toastify";
import { GameState } from "./SocketContext/Index.jsx";
import LogIn from "./LogIn/Index.tsx"; // Import your login component
import { MapTokenProvider, useMapTokenContext } from "./Map&TokenContext/Index.jsx"; // Import your context
import axios from 'axios';
import "react-toastify/dist/ReactToastify.css";


function MainApp() {
  const { src } = useMapTokenContext();
  const [open, setOpen] = useState(false);
  const [mapType, setMapType] = useState("image");
  const [tokenSrc, setTokenSrc] = useState("/Darius.jpeg");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "blur(30px)",
    zIndex: -10,
  };

  return (
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
        <MapViewer type={mapType} token={tokenSrc} />
      </Box>
    </Container>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <GameState isLoggedIn={isLoggedIn} >
      <MapTokenProvider>
        {isLoggedIn ? (
          <MainApp />
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
