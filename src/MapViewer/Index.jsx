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
} from "@mui/material";
import { MapInteractionCSS } from "react-map-interaction";

function MapViewer({ type, src }) {
  const canvasRef = useRef(null); // Reference to the main image canvas
  const fogCanvasRef = useRef(null); // Reference to the canvas for fog of war
  const gridCanvasRef = useRef(null); // Reference to the canvas for grid lines
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }); // State for storing dimensions and position of the canvas
  const [scale, setScale] = useState(1.1); // State for storing the current zoom scale
  const [translation, setTranslation] = useState({ x: 0, y: 0 }); // State for storing the current translation of the canvas
  const [gridSpacing, setGridSpacing] = useState(50); // State for storing grid spacing
  const [showGrid, setShowGrid] = useState(false); // State to toggle grid visibility
  const [showFogOfWar, setShowFogOfWar] = useState(false); // State to toggle fog of war visibility
  const [showGridSettings, setShowGridSettings] = useState(false); // State to toggle visibility of grid settings
  const [spraying, setSpraying] = useState(false); // State to track if spraying is active
  const [mode, setMode] = useState("view"); // State to toggle between view and edit modes
  const [fogMode, setFogMode] = useState("spray"); // State to toggle between spray and erase modes for fog

  // This useEffect adjusts the cursor based on the fog of war mode.
  // When in edit mode and fog of war is active, it changes the cursor
  // to a visual representation of the tool in use (spray or erase).
  // Spray shows a white circle, erase shows a red circle. If not in
  // a state that affects the cursor (like default mode), it resets to default cursor.
  useEffect(() => {
    if (fogCanvasRef.current) {
      if (mode === "edit" && showFogOfWar) {
        switch (fogMode) {
          case "spray":
            fogCanvasRef.current.style.cursor =
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewport='0 0 40 40' fill='none'><circle cx='20' cy='20' r='19' stroke='white' stroke-width='2'/></svg>\"), auto";
            break;
          case "erase":
            fogCanvasRef.current.style.cursor =
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewport='0 0 40 40' fill='none'><circle cx='20' cy='20' r='19' stroke='red' stroke-width='2'/></svg>\"), auto";
            break;
          default:
            fogCanvasRef.current.style.cursor = "auto";
            break;
        }
      } else {
        fogCanvasRef.current.style.cursor = "auto";
      }
    }
  }, [mode, fogMode, showFogOfWar]);

  // This useEffect is triggered when the component loads or when any dependencies change.
  // It checks if the provided 'type' is an image and if the necessary canvas references are available.
  // It then loads the image, calculates optimal dimensions based on the viewport to maintain aspect ratio without overflow,
  // and sets these dimensions to state. It also adjusts canvas sizes and sets the image onto the canvas.
  // Finally, it initializes the grid based on current settings if 'showGrid' is true.
  useEffect(() => {
    if (
      type === "image" &&
      canvasRef.current &&
      fogCanvasRef.current &&
      gridCanvasRef.current
    ) {
      const canvas = canvasRef.current;
      const fogCanvas = fogCanvasRef.current;
      const gridCanvas = gridCanvasRef.current;
      const ctx = canvas.getContext("2d");
      const fogCtx = fogCanvas.getContext("2d");
      const gridCtx = gridCanvas.getContext("2d");
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.9;
        const scaleFactor = Math.min(
          maxWidth / img.width,
          maxHeight / img.height
        );

        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;

        setDimensions({
          width: scaledWidth,
          height: scaledHeight,
          x: (window.innerWidth - scaledWidth) / 2,
          y: (window.innerHeight - scaledHeight) / 2,
        });
        setTranslation({
          x: (window.innerWidth - scaledWidth * scaleFactor) / 2.5,
          y: (window.innerHeight - scaledHeight * scaleFactor) / 40,
        });

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        fogCanvas.width = scaledWidth;
        fogCanvas.height = scaledHeight;
        gridCanvas.width = scaledWidth;
        gridCanvas.height = scaledHeight;

        ctx.clearRect(0, 0, scaledWidth, scaledHeight);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        updateGrid(gridCtx, scaledWidth, scaledHeight, gridSpacing);
      };
    }
  }, [type, src, showGrid, showFogOfWar, gridSpacing]);

  // Function to update the grid based on current settings
  const updateGrid = (ctx, width, height, spacing) => {
    ctx.clearRect(0, 0, width, height);
    if (showGrid) {
      drawGrid(ctx, width, height, spacing);
    }
  };

  // Draws grid lines on the grid canvas
  const drawGrid = (ctx, width, height, spacing) => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    for (let x = spacing; x < width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = spacing; y < height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  // Toggles the grid visibility
  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  // Toggles the fog of war visibility
  const handleFogOfWarToggle = () => {
    setShowFogOfWar(!showFogOfWar);
  };

  // Updates the grid spacing based on user input
  const handleGridSpacingChange = (event, newValue) => {
    setGridSpacing(newValue);
    if (gridCanvasRef.current) {
      updateGrid(
        gridCanvasRef.current.getContext("2d"),
        dimensions.width,
        dimensions.height,
        newValue
      );
    }
  };

  // Changes the mode between view and edit
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
  };

  // Changes the fog mode between spray and erase
  const handleFogModeChange = (event, newFogMode) => {
    setFogMode(newFogMode);
  };

  // Activates spraying when mouse is pressed down
  const handleMouseDown = () => {
    if (mode === "edit" && showFogOfWar) {
      setSpraying(true);
    }
  };

  // Deactivates spraying when mouse is released
  const handleMouseUp = () => {
    setSpraying(false);
  };

  // Handles the application of fog or erasing based on mouse movement
  const handleMouseMove = (event) => {
    if (spraying && showFogOfWar) {
      const fogCanvas = fogCanvasRef.current;
      const fogCtx = fogCanvas.getContext("2d");
      const rect = fogCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      fogCtx.globalCompositeOperation =
        fogMode === "erase" ? "destination-out" : "source-over";

      fogCtx.beginPath();
      fogCtx.arc(x, y, 20, 0, 2 * Math.PI);
      fogCtx.fill();
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
        Map Viewer
      </Typography>

      <Box
        sx={{
          position: "absolute",
          top: "70px",
          left: "16px",
          zIndex: 20,
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <FormControlLabel
          control={<Checkbox checked={showGrid} onChange={handleGridToggle} />}
          label="Show Grid"
          sx={{ color: "white" }}
        />
        {showGrid && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowGridSettings(!showGridSettings)}
              sx={{ marginTop: 1 }}
            >
              Grid Settings
            </Button>
            {showGridSettings && (
              <Slider
                value={gridSpacing}
                onChange={handleGridSpacingChange}
                min={10}
                max={200}
                sx={{ marginTop: 2, color: "white" }}
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
          sx={{ color: "white" }}
        />
        {showFogOfWar && (
          <>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              sx={{ marginTop: 2 }}
            >
              <ToggleButton value="view" sx={{ color: "white" }}>
                View
              </ToggleButton>
              <ToggleButton value="edit" sx={{ color: "white" }}>
                Edit
              </ToggleButton>
            </ToggleButtonGroup>
            {mode === "edit" && (
              <ToggleButtonGroup
                value={fogMode}
                exclusive
                onChange={handleFogModeChange}
                sx={{ marginTop: 2 }}
              >
                <ToggleButton value="spray" sx={{ color: "white" }}>
                  Spray Fog
                </ToggleButton>
                <ToggleButton value="erase" sx={{ color: "white" }}>
                  Erase Fog
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </>
        )}
      </Box>

      <MapInteractionCSS
        value={{ scale, translation }}
        onChange={({ scale, translation }) => {
          setScale(scale);
          setTranslation(translation);
        }}
        showControls={mode === "view"}
        disableZoom={mode === "edit"}
        disablePan={mode === "edit"}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {type === "image" && (
          <div
            style={{
              position: "relative",
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
            }}
          >
            <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
            <canvas
              ref={gridCanvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
            <canvas
              ref={fogCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>
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
      </MapInteractionCSS>
    </Box>
  );
}

export default MapViewer;
