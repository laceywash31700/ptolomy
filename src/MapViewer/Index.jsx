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
import { MapInteractionCSS } from "react-map-interaction";

function MapViewer({ type, src }) {
  const canvasRef = useRef(null); // Main canvas reference
  const fogCanvasRef = useRef(null); // Fog of war canvas reference
  const gridCanvasRef = useRef(null); // Grid canvas reference
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  }); // State for storing canvas dimensions
  const [scale, setScale] = useState(1.1); // State for scaling the canvas
  const [translation, setTranslation] = useState({ x: 0, y: 0 }); // State for canvas translation
  const [gridSpacing, setGridSpacing] = useState(50); // State for grid spacing
  const [showGrid, setShowGrid] = useState(false); // State to show/hide grid
  const [showFogOfWar, setShowFogOfWar] = useState(false); // State to show/hide fog of war
  const [showGridSettings, setShowGridSettings] = useState(false); // State to show/hide grid settings slider
  const [spraying, setSpraying] = useState(false); // State to track if fog of war is being sprayed
  const [mode, setMode] = useState("view"); // State to track mode (view or edit)
  const [fogMode, setFogMode] = useState("spray"); // State to track fog mode (spray or erase)
  const [unitDistance, setUnitDistance] = useState(5); // State to set the unit distance for ruler
  const [rulerActive, setRulerActive] = useState(false); // State to track if ruler is active
  const [rulerStart, setRulerStart] = useState(null); // State to store start point of ruler
  const [rulerEnd, setRulerEnd] = useState(null); // State to store end point of ruler

  // Toggles the ruler tool
  const handleRulerToggle = () => {
    setRulerActive(!rulerActive);
    setRulerStart(null);
    setRulerEnd(null);
  };

  // Handles mouse down event for fog of war and ruler tool
  const handleMouseDown = (event) => {
    if (mode === "edit" && showFogOfWar) {
      setSpraying(true);
    } else if (rulerActive && fogCanvasRef.current) {
      const rect = fogCanvasRef.current.getBoundingClientRect();
      setRulerStart({
        x: (event.clientX - rect.left) / scale,
        y: (event.clientY - rect.top) / scale,
      });
      setRulerEnd(null);
    }
  };

  // Handles mouse move event for fog of war and ruler tool
  const handleMouseMove = (event) => {
    if (spraying && showFogOfWar) {
      const fogCanvas = fogCanvasRef.current;
      const fogCtx = fogCanvas.getContext("2d");
      const rect = fogCanvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / scale;
      const y = (event.clientY - rect.top) / scale;

      fogCtx.globalCompositeOperation =
        fogMode === "erase" ? "destination-out" : "source-over";

      fogCtx.beginPath();
      fogCtx.arc(x, y, 20, 0, 2 * Math.PI);
      fogCtx.fill();
    } else if (rulerActive && rulerStart && fogCanvasRef.current) {
      const rect = fogCanvasRef.current.getBoundingClientRect();
      setRulerEnd({
        x: (event.clientX - rect.left) / scale,
        y: (event.clientY - rect.top) / scale,
      });
      drawTemporaryLine();
    }
  };

  // Handles mouse up event to stop spraying and clear the ruler line
  const handleMouseUp = () => {
    setSpraying(false);
    if (rulerActive && rulerStart) {
      if (fogCanvasRef.current) {
        const ctx = fogCanvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      }
      setRulerStart(null);
      setRulerEnd(null);
    }
  };

  // Draws the temporary ruler line and calculates the distance
  const drawTemporaryLine = () => {
    if (rulerStart && rulerEnd && fogCanvasRef.current) {
      const ctx = fogCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.beginPath();
      ctx.moveTo(rulerStart.x, rulerStart.y);
      ctx.lineTo(rulerEnd.x, rulerEnd.y);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculate distance
      const dx = rulerEnd.x - rulerStart.x;
      const dy = rulerEnd.y - rulerStart.y;
      const pixelDistance = Math.sqrt(dx * dx + dy * dy);
      const gridDistance = pixelDistance / gridSpacing;
      const distance = Math.round(gridDistance) * unitDistance;

      // Display distance
      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`${distance} ft`, (rulerStart.x + rulerEnd.x) / 2, (rulerStart.y + rulerEnd.y) / 2);
    }
  };

  // Effect to update cursor style based on fog mode and edit mode
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

  // Effect to load the image and initialize canvas dimensions and grid
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
          x: (window.innerWidth - scaledWidth) / 2,
          y: (window.innerHeight - scaledHeight) / 2,
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

  // Draws the grid lines on the canvas
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

  // Handles changes to grid spacing and updates the grid
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

  // Updates the grid lines on the canvas
  const updateGrid = (ctx, width, height, spacing) => {
    ctx.clearRect(0, 0, width, height);
    if (showGrid) {
      drawGrid(ctx, width, height, spacing);
    }
  };

  // Toggles the grid visibility
  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  // Toggles the fog of war visibility
  const handleFogOfWarToggle = () => {
    setShowFogOfWar(!showFogOfWar);
  };

  // Handles mode changes between view and edit
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
  };

  // Handles fog mode changes between spray and erase
  const handleFogModeChange = (event, newFogMode) => {
    setFogMode(newFogMode);
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
      </Box>

      {/* Main interactive area with image or video and overlays */}
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
