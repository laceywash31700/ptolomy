import "./App.css";
import { useState } from "react";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Maps from "./Maps/Index";

function App() {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
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
      <Maps open={open} handleClose={handleClose} />
    </>
  );
}

export default App;