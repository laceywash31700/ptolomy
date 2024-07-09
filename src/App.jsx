import React, { useState } from "react";
import { Container, Box, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Maps from "./Maps/Index";
import MapViewer from "./MapViewer/Index";

function App() {
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState([]);
  const [mapType, setMapType] = useState("image");
  const [mapSrc, setMapSrc] = useState("/FeyRuinsAutumn.jpg");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${mapSrc})`,
    backgroundSize: '100%', 
    backgroundPosition: 'center',
    filter: "blur(30px)",
    zIndex: -10
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
        <Maps open={open} handleClose={handleClose} maps={maps} />
        <MapViewer type={mapType} src={mapSrc} />
      </Box>
    </Container>
  );
}

export default App;
