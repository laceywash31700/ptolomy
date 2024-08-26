import React, { useState } from "react";
import { Container, Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Maps from "./Maps/Index";
import MapViewer from "./MapViewer/Index";
import { ToastContainer } from "react-toastify";
import { GameState } from "./SocketContext/Index";
import LogIn from "./LogIn/Index"; // Import your login component
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState([]);
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
            <Maps open={open} handleClose={handleClose} maps={maps} />
            <MapViewer type={mapType} src={mapSrc} token={tokenSrc} />
          </Box>
        </Container>
      ) : (
        <>
          <LogIn login={handleLogin} />
          <ToastContainer />
        </>
      )}
    </GameState>
  );
}

export default App;
