import axios from "axios";
import ReactPlayer from "react-player";
import { useEffect, useRef, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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
        const maxHeight = window.innerHeight * 0.8; // Adjust as needed
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
    <>
      {" "}
      <TransformWrapper>
        <Paper
          elevation={3}
          style={{
            width: "80vw", // Adjust as needed
            height: "80vh", // Adjust as needed
            padding: "16px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            overflow: "hidden",
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), ${
              type === "image" ? `url(${src})` : "none"
            }`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px) brightness(80%)",
          }}
        />
        {/* Typography and Canvas components */}
        <Box
          sx={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 10,
          }}
        >
          <Typography variant="h5" component="div" gutterBottom>
            Map Viewer
          </Typography>
        </Box>
        <TransformComponent>
          {type === "image" && (
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "100%",
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
              style={{ position: "absolute", top: "0", left: "0" }}
            />
          )}{" "}
        </TransformComponent>
      </TransformWrapper>
    </>
  );
}

export default MapViewer;
