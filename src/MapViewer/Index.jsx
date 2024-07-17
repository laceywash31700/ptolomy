import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from "@mui/material";
import { Stage, Layer, Rect, Image as KonvaImage, Line } from "react-konva";
import useImage from "use-image";

function MapViewer({ type, src }) {
  const stageRef = useRef(null); // Reference to the Konva Stage
  const startDragOffset = useRef({ x: 0, y: 0 });
  const draggingStage = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1.1);
  const [translation, setTranslation] = useState({ x: 0, y: 0 });
  const [gridSpacing, setGridSpacing] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [showFogOfWar, setShowFogOfWar] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [spraying, setSpraying] = useState(false);
  const [mode, setMode] = useState("view");
  const [fogMode, setFogMode] = useState("spray");
  const [unitDistance, setUnitDistance] = useState(5);
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [image] = useImage(src); // Load main image using useImage hook

  // Add a new token to the map
  const addToken = (url) => {
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const newToken = {
        image: img,
        name: "Token",
        effect: [],
        position: { x: 0, y: 0 },
        size: gridSpacing,
      };
      setTokens((prevTokens) => [...prevTokens, newToken]);
    };
  };

  // Handle zooming with the mouse wheel
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * 1.1 : oldScale / 1.1;
    setScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    setTranslation(newPos);
  };

  // Load the main image and set dimensions
  useEffect(() => {
    if (type === "image" && image) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.9;
        const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);

        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;

        setDimensions({
          width: scaledWidth,
          height: scaledHeight,
        });
        setTranslation({
          x: (window.innerWidth - scaledWidth) / 2,
          y: (window.innerHeight - scaledHeight) / 2,
        });
      };
    }
  }, [type, src, image]);

  // Handle changes to grid spacing
  const handleGridSpacingChange = (event, newValue) => {
    setGridSpacing(newValue);
  };

  // Toggle the grid visibility
  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  // Toggle the fog of war visibility
  const handleFogOfWarToggle = () => {
    setShowFogOfWar(!showFogOfWar);
  };

  // Change the mode between view and edit
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
  };

  // Change the fog mode between spray and erase
  const handleFogModeChange = (event, newFogMode) => {
    setFogMode(newFogMode);
  };

  // Toggle the ruler tool
  const handleRulerToggle = () => {
    setRulerActive(!rulerActive);
    setRulerStart(null);
    setRulerEnd(null);
  };

  // Handle mouse down events on the stage
  const handleStageMouseDown = (e) => {
    if (mode === "view") {
      const isElement = e.target.className === "Image";
      if (isElement) {
        return;
      }
      draggingStage.current = true;
      startDragOffset.current = {
        x: e.evt.clientX - stageRef.current.x(),
        y: e.evt.clientY - stageRef.current.y(),
      };
    } else if (rulerActive) {
      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      const adjustedPointerPos = {
        x: (pointerPos.x - stage.x()) / stage.scaleX(),
        y: (pointerPos.y - stage.y()) / stage.scaleY(),
      };
      setRulerStart(adjustedPointerPos);
      setRulerEnd(null);
    }
  };

  // Handle mouse move events on the stage
  const handleStageMouseMove = (e) => {
    if (draggingStage.current) {
      const stage = stageRef.current;
      stage.position({
        x: e.evt.clientX - startDragOffset.current.x,
        y: e.evt.clientY - startDragOffset.current.y,
      });
      stage.batchDraw();
    } else if (rulerActive && rulerStart) {
      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      const adjustedPointerPos = {
        x: (pointerPos.x - stage.x()) / stage.scaleX(),
        y: (pointerPos.y - stage.y()) / stage.scaleY(),
      };
      setRulerEnd(adjustedPointerPos);
    }
  };

  // Handle mouse up events on the stage
  const handleStageMouseUp = () => {
    draggingStage.current = false;
    if (rulerActive && rulerStart) {
      setRulerStart(null);
      setRulerEnd(null);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Title of the application */}
      <Typography
        variant="h5"
        component="div"
        gutterBottom
        sx={{
          position: "inherit",
          top: "16px",
          left: "16px",
          zIndex: 20,
          color: "white",
        }}
      >
        Ptolemy
      </Typography>

      {/* Control panel for toggling grid, fog of war, and ruler */}
      <Box
        sx={{
          position: "absolute",
          top: "70px",
          left: "16px",
          zIndex: 20,
          color: "white",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={showGrid} onChange={handleGridToggle} />}
          label="Grid"
          sx={{ color: "white" }}
        />

        {showGrid && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowGridSettings(!showGridSettings)}
              sx={{ mt: 2 }}
            >
              Grid Settings
            </Button>
            {showGridSettings && (
              <Slider
                value={gridSpacing}
                onChange={handleGridSpacingChange}
                min={10}
                max={200}
                sx={{ mt: 2, color: "white" }}
                aria-labelledby="grid-spacing-slider"
              />
            )}
          </>
        )}

        <FormControlLabel
          control={
            <Checkbox checked={showFogOfWar} onChange={handleFogOfWarToggle} />
          }
          label="Fog of War"
          sx={{ mt: 2 }}
        />

        <FormControlLabel
          control={
            <Checkbox checked={rulerActive} onChange={handleRulerToggle} />
          }
          label="Ruler Tool"
          sx={{ mt: 2 }}
        />

        {(showFogOfWar || rulerActive) && (
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={handleModeChange}
            sx={{
              mt: 2,
              "& .MuiToggleButton-root": {
                color: "white",
                "&.Mui-selected": {
                  color: "cyan",
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              },
            }}
          >
            <ToggleButton value="view" sx={{ color: "inherit" }}>
              View
            </ToggleButton>
            <ToggleButton value="edit" sx={{ color: "inherit" }}>
              Edit
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {showFogOfWar && mode === "edit" && (
          <ToggleButtonGroup
            value={fogMode}
            exclusive
            onChange={handleFogModeChange}
            sx={{
              mt: 2,
              "& .MuiToggleButton-root": {
                color: "white",
                "&.Mui-selected": {
                  color: "cyan",
                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              },
            }}
          >
            <ToggleButton value="spray" sx={{ color: "inherit" }}>
              Spray Fog
            </ToggleButton>
            <ToggleButton value="erase" sx={{ color: "inherit" }}>
              Erase Fog
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {rulerActive && (
          <TextField
            label="Unit Distance (ft)"
            type="number"
            value={unitDistance}
            onChange={(e) => setUnitDistance(Number(e.target.value))}
            InputProps={{
              inputProps: { min: 1, max: 100 },
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "white" },
            }}
            sx={{
              mt: 2,
              width: "120px",
              bgcolor: "black",
              "& .MuiInput-underline:before": {
                borderBottomColor: "white",
              },
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: ["white", "!important"],
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "white",
              },
            }}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => addToken("/Darius.jpeg")}
          sx={{ mt: 2 }}
        >
          Add Token
        </Button>
      </Box>

      {/* Main interactive area with image or video and overlays */}
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        x={translation.x}
        y={translation.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        ref={stageRef}
        draggable={mode === "view"}
      >
        <Layer>
          {type === "image" && image && (
            <KonvaImage
              image={image}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
          {type !== "image" && (
            <ReactPlayer
              url={src}
              controls={true}
              width="100%"
              height="100%"
              style={{ position: "relative" }}
            />
          )}
        </Layer>
        {showGrid && (
          <Layer>
            {[...Array(Math.ceil(dimensions.width / gridSpacing)).keys()].map((i) => (
              <Line
                points={[i * gridSpacing, 0, i * gridSpacing, dimensions.height]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1}
                key={`v${i}`}
              />
            ))}
            {[...Array(Math.ceil(dimensions.height / gridSpacing)).keys()].map((i) => (
              <Line
                points={[0, i * gridSpacing, dimensions.width, i * gridSpacing]}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth={1}
                key={`h${i}`}
              />
            ))}
          </Layer>
        )}
        {showFogOfWar && (
          <Layer id="fogLayer">
            <Rect
              width={dimensions.width}
              height={dimensions.height}
              fill="rgba(0,0,0,0.5)"
            />
          </Layer>
        )}
        <Layer id="tokenLayer">
          {tokens.map((token, index) => (
            <KonvaImage
              key={index}
              image={token.image}
              x={token.position.x}
              y={token.position.y}
              width={token.size}
              height={token.size}
              draggable
              onDragEnd={(e) => {
                const updatedTokens = tokens.map((t) =>
                  t === token
                    ? { ...t, position: { x: e.target.x(), y: e.target.y() } }
                    : t
                );
                setTokens(updatedTokens);
              }}
            />
          ))}
        </Layer>
        <Layer id="rulerLayer">
          {rulerStart && rulerEnd && (
            <Line
              points={[rulerStart.x, rulerStart.y, rulerEnd.x, rulerEnd.y]}
              stroke="red"
              strokeWidth={2}
            />
          )}
        </Layer>
      </Stage>
    </Box>
  );
}

export default MapViewer;
