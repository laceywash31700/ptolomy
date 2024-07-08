import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Box, Typography, FormControlLabel, Checkbox, Slider, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { MapInteractionCSS } from "react-map-interaction";

function MapViewer({ type, src }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [gridSpacing, setGridSpacing] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [showFogOfWar, setShowFogOfWar] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [spraying, setSpraying] = useState(false); // State to track if the user is currently spraying
  const [mode, setMode] = useState("view"); // State to track the current mode (view or edit)
  const [fogMode, setFogMode] = useState("spray"); // State to track fog mode (spray or erase)

  useEffect(() => {
    if (type === "image" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        const initialScalingMultiplier = 1.2;
        const scaleFactor =
          Math.min(maxWidth / img.width, maxHeight / img.height) *
          initialScalingMultiplier;

        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;

        const centerX = (window.innerWidth - scaledWidth) / 2;
        const centerY = (window.innerHeight - scaledHeight) / 2;

        setDimensions({
          width: scaledWidth,
          height: scaledHeight,
          x: centerX,
          y: centerY,
        });

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        redrawCanvas(ctx, img, scaledWidth, scaledHeight);
      };
    }
  }, [type, src, showGrid, showFogOfWar, gridSpacing]);

  const redrawCanvas = (ctx, img, scaledWidth, scaledHeight) => {
    ctx.clearRect(0, 0, scaledWidth, scaledHeight);
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1;

      for (let x = gridSpacing; x < scaledWidth; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, scaledHeight);
      }

      for (let y = gridSpacing; y < scaledHeight; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(scaledWidth, y);
      }

      ctx.stroke();
    }

    if (showFogOfWar) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);
    }
  };

  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  const handleFogOfWarToggle = () => {
    setShowFogOfWar(!showFogOfWar);
    if (!showFogOfWar) {
      setMode("view");
    } else {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = src;
      img.onload = () => {
        redrawCanvas(ctx, img, dimensions.width, dimensions.height);
      };
    }
  };

  const handleGridSettingsToggle = () => {
    setShowGridSettings(!showGridSettings);
  };

  const handleGridSpacingChange = (event, newValue) => {
    setGridSpacing(newValue);
  };

  const handleMouseDown = () => {
    if (mode === "edit" && showFogOfWar) {
      setSpraying(true); // Start spraying
    }
  };

  const handleMouseUp = () => {
    setSpraying(false); // Stop spraying
  };

  const handleMouseMove = (event) => {
    if (spraying) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const radius = 20; // Radius of the fog sprayer

      if (fogMode === 'erase') {
        ctx.globalCompositeOperation = 'destination-out'; // Erase mode: make areas transparent
      } else {
        ctx.globalCompositeOperation = 'source-over'; // Spray mode: add fog
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Fog color for spraying
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2, false);
      ctx.fill();
    }
  };

  const handleModeChange = (event, newMode) => {
    setMode(newMode);
  };

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
          top: "16px",
          right: "16px",
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleGridSettingsToggle}
            sx={{ marginTop: 1 }}
          >
            Grid Settings
          </Button>
        )}
        {showGridSettings && (
          <Slider
            value={gridSpacing}
            min={10}
            max={200}
            onChange={handleGridSpacingChange}
            sx={{ marginTop: 2, color: "white" }}
            aria-labelledby="grid-spacing-slider"
          />
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
              <ToggleButton value="view" sx={{ color: "white" }}>View</ToggleButton>
              <ToggleButton value="edit" sx={{ color: "white" }}>Edit</ToggleButton>
            </ToggleButtonGroup>
            {mode === "edit" && (
              <ToggleButtonGroup
                value={fogMode}
                exclusive
                onChange={handleFogModeChange}
                sx={{ marginTop: 2 }}
              >
                <ToggleButton value="spray" sx={{ color: "white" }}>Spray Fog</ToggleButton>
                <ToggleButton value="erase" sx={{ color: "white" }}>Erase Fog</ToggleButton>
              </ToggleButtonGroup>
            )}
          </>
        )}
      </Box>
      <Box
        sx={{
          position: "relative",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), ${
            type === "image" ? `url(${src})` : "none"
          }`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px) brightness(100%)",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <MapInteractionCSS
          scaleMin={0.5}
          scaleMax={30}
          defaultValue={{
            scale: 1,
            translation: {
              x: window.innerWidth / 2.6,
              y: window.innerHeight / 25,
            },
          }}
          showControls={mode === "view"}
          disableZoom={mode === "edit"}
          disablePan={mode === "edit"}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              objectFit: "contain",
            }}
          />
        </MapInteractionCSS>
      </Box>
    </Box>
  );
}

export default MapViewer;
