import "./App.css";
import { useState } from "react";
import { Fab, Container, Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Maps from "./Maps/Index";
import MapViewer from "./MapViewer/Index";

function App() {
  const [open, setOpen] = useState(false);
  const [maps, setMaps] = useState([]);
  const [mapType, setMapType] = useState("image");
  const [mapSrc, setMapSrc] = useState("/SecretGrotto.jpg");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container>
      <Box sx={{ position: "relative", minHeight: "100vh" }}>
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <MapViewer type={mapType} src={mapSrc} />
        </Box>
      </Box>
    </Container>
  );
}

export default App;
