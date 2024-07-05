import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Box, Typography } from "@mui/material";
import { MapInteractionCSS } from "react-map-interaction";

function MapViewer({ type, src }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (type === "image" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const maxWidth = window.innerWidth * 0.9; // Adjust as needed
        const maxHeight = window.innerHeight * 0.9; // Adjust as needed
        const scaleFactor = Math.min(
          maxWidth / img.width,
          maxHeight / img.height
        );

        const scaledWidth = img.width * scaleFactor;
        const scaledHeight = img.height * scaleFactor;

        setDimensions({ width: scaledWidth, height: scaledHeight });
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      };
    }
  }, [type, src]);

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
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {type === "image" && (
            <canvas
              ref={canvasRef}
              style={{
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
                objectFit: "contain",
              }}
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
        </MapInteractionCSS>
      </Box>
    </Box>
  );
}

export default MapViewer;
