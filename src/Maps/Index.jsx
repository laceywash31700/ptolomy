import { Box, Modal, Typography } from "@mui/material";
import DragAndDrop from "../Drag&Drop/Index";

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

function Maps({ open, handleClose, maps }) {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {maps.length === 0 ? (
          <>
            <Typography variant="h6" component="h2" align="center">
              There currently are no uploaded maps
            </Typography>
            <DragAndDrop />
          </>
        ) : (
          <>
            <div>
              There are maps that are available do you want to add a new map
            </div>
            <DragAndDrop />
          </>
        )}
      </Box>
    </Modal>
  );
}

export default Maps;
