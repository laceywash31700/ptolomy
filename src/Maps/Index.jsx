import { Box, Modal} from "@mui/material";
import MapDragAndDrop from "../MapDrag&Drop/Index";
import TokenDragAndDrop from "../TokenDrag&Drop/Index";

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
            <MapDragAndDrop/>
            <br/>
            <TokenDragAndDrop/>
          </>
        ) : (
          <>
            <MapDragAndDrop />
            <br/>
            <TokenDragAndDrop/>
          </>
        )}
      </Box>
    </Modal>
  );
}

export default Maps;
