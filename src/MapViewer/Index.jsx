import React, { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { Box, Typography } from "@mui/material";
import { MapInteractionCSS } from "react-map-interaction";

function MapViewer({ type, src }) {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

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
        const scaleFactor = Math.min(
          maxWidth / img.width,
          maxHeight / img.height
        ) * initialScalingMultiplier;

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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
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
          scaleMin={0.5}
          scaleMax={30} 
          defaultValue={{
            scale: 1,
            translation: {
              x: window.innerWidth / 2.6,
              y: window.innerHeight / 25,
            },
          }}
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
