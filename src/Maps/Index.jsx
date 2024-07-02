import { Box, Modal, Typography } from "@mui/material";
import DragAndDrop from "../Drag&Drop/Index";

function Maps({ open, handleClose }) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" align="center">
          There currently are no uploaded maps
        </Typography>
        <DragAndDrop />
      </Box>
    </Modal>
  );
}

export default Maps;
