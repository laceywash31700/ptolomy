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
import {
  Stage,
  Layer,
  Group,
  Rect,
  Image as KonvaImage,
  Line,
  Text,
  Transformer,
} from "react-konva";
import EditIcon from "/edit.png"; // Update with the correct path
import DeleteIcon from "/bin.png"; // Update with the correct path
import BloodiedIcon from "/blood.png"; // Update with the correct path
import DeadIcon from "/skull.png"; // Update with the correct path
import useImage from "use-image";
import MapList from "../MapList/Index";
import { v4 as uuidv4 } from "uuid";
import { useMapTokenContext } from "../Map&TokenContext/Index";
import { useSocket } from "../SocketContext/Index";

function MapViewer({ type }) {
  const { src } = useMapTokenContext();
  const { socket } = useSocket();

  const stageRef = useRef(null); // Reference to the Konva Stage
  const [scale, setScale] = useState(1.1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [translation, setTranslation] = useState({ x: 0, y: 0 });

  const [gridSpacing, setGridSpacing] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [mode, setMode] = useState("view");

  const fogLayerRef = useRef(null); // Reference to the fog layer
  const fogCanvasRef = useRef(null); // Reference to the fog canvas
  const [fogMode, setFogMode] = useState("spray");
  const [showFogOfWar, setShowFogOfWar] = useState(false);
  const [spraying, setSpraying] = useState(false);

  const [unitDistance, setUnitDistance] = useState(5);
  const [rulerActive, setRulerActive] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);

  const draggingStage = useRef(false);
  const transformerRef = useRef(null);
  const startDragOffset = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });
  const [inputValue, setInputValue] = useState("");

  const [image] = useImage(src); // Load main image using useImage hook
  const [editIcon] = useImage(EditIcon);
  const [deleteIcon] = useImage(DeleteIcon);
  const [bloodiedIcon] = useImage(BloodiedIcon);
  const [deadIcon] = useImage(DeadIcon);

  // Handle changes to grid spacing
  const handleGridSpacingChange = (event, newValue) => {
    setGridSpacing(newValue);
  };

  // Toggle the grid visibility
  const handleGridToggle = () => {
    setShowGrid(!showGrid);
  };

  // Change the mode between view and edit
  const handleModeChange = (event, newMode) => {
    setMode(newMode);
  };

  // Toggle the fog of war visibility
  const handleFogOfWarToggle = () => {
    setShowFogOfWar(!showFogOfWar);
  };

  // Change the fog mode between spray and erase
  const handleFogModeChange = (event, newFogMode) => {
    setFogMode(newFogMode);
  };

  // Apply fog to the entire map
  const applyFogToEntireMap = () => {
    const fogCanvas = fogCanvasRef.current;
    if (fogCanvas) {
      const fogCtx = fogCanvas.getContext("2d");
      fogCtx.clearRect(0, 0, dimensions.width, dimensions.height);
      fogCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
      fogCtx.fillRect(0, 0, dimensions.width, dimensions.height);
      fogLayerRef.current.getLayer().batchDraw();
    }
  };

  // Toggle the ruler tool
  const handleRulerToggle = () => {
    setRulerActive(!rulerActive);
    setRulerStart(null);
    setRulerEnd(null);
  };

  const calculateDistance = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy);
    const squares = Math.floor(distanceInPixels / gridSpacing);
    return squares * unitDistance;
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
    } else if (mode === "edit" && showFogOfWar) {
      setSpraying(true);
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
    } else if (spraying) {
      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      const fogCanvas = fogCanvasRef.current;
      if (fogCanvas) {
        const fogCtx = fogCanvas.getContext("2d");
        const x = (pointerPos.x - stage.x()) / stage.scaleX();
        const y = (pointerPos.y - stage.y()) / stage.scaleY();

        if (fogMode === "spray") {
          fogCtx.globalCompositeOperation = "source-over";
          fogCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
        } else if (fogMode === "erase") {
          fogCtx.globalCompositeOperation = "destination-out";
        }

        fogCtx.beginPath();
        fogCtx.arc(x, y, 20, 0, 2 * Math.PI);
        fogCtx.fill();
        fogLayerRef.current.getLayer().batchDraw();
      }
    }
  };

  // Handle mouse up events on the stage
  const handleStageMouseUp = () => {
    draggingStage.current = false;
    setSpraying(false);
    if (rulerActive && rulerStart) {
      setRulerStart(null);
      setRulerEnd(null);
    }
  };

  // Add a new token to the map
  const addToken = (url) => {
    const newToken = {
      id: uuidv4(),
      imageUrl: url,
      name: "Token",
      effects: [], // Initialize as an empty array
      position: { x: 0, y: 0 },
      size: gridSpacing,
    };
    setTokens((prevTokens) => {
      const updatedTokens = [...prevTokens, newToken];
      // Emit the new token to the server after it's created
      socket.emit("new-token", { ...newToken, image: undefined }); // <-- Emit the token object
      console.log("New token emitted:", socket);
      return updatedTokens;
    });
  };

  const handleTokenClick = (token) => {
    if (selectedToken && selectedToken.id === token.id) {
      setSelectedToken(null);
    } else {
      setSelectedToken(token);
    }
  };

  const handleStageClick = (e) => {
    if (e.target === stageRef.current) {
      setSelectedToken(null);
      setInputVisible(false);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (e, token) => {
    const updatedTokens = tokens.map((t) =>
      t.id === token.id
        ? { ...t, position: { x: e.target.x(), y: e.target.y() } }
        : t
    );
    // console.log("this is the tokens position",token.position);
    setTokens(updatedTokens);

    socket.emit("update-token-position", {
      id: token.id,
      position: { x: e.target.x(), y: e.target.y() },
    });
  };

  const handleDragEnd = (e, token) => {
    setIsDragging(false);
    const updatedTokens = tokens.map((t) =>
      t.id === token.id
        ? { ...t, position: { x: e.target.x(), y: e.target.y() } }
        : t
    );
    setTokens(updatedTokens);

    socket.emit("update-token-position", {
      id: token.id,
      position: { x: e.target.x(), y: e.target.y() },
    });
  };

  const removeToken = (id) => {
    setTokens((prevTokens) => prevTokens.filter((token) => token.id !== id));
    setSelectedToken(null);
  };

  const updateTokenName = (name) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.id === selectedToken.id ? { ...token, name } : token
      )
    );
  };

  const addTokenEffect = (effect) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.id === selectedToken.id
          ? { ...token, effects: [...token.effects, effect] }
          : token
      )
    );
  };

  const handleEditTokenName = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    updateTokenName(inputValue);
    setInputVisible(false);
  };

  const showInputField = (x, y, value) => {
    setInputPosition({ x, y });
    setInputValue(value);
    setInputVisible(true);
  };

  // useEffect for taking in new tokenData from server when another client adds a new token.
  useEffect(() => {
    if (socket) {
      socket.on("new-token-broadcast", (tokenData) => {
        setTokens((prevTokens) => [...prevTokens, tokenData]);
      });

      // Clean up the listener when the component unmounts
      return () => {
        socket.off("new-token-broadcast");
      };
    }
  }, [socket]);

  // useEffect to dynamically change url prop in token obj to an image object when the the tokens state changes.
  useEffect(() => {
    tokens.forEach((token) => {
      // If the token doesn't have the image object, load it
      if (!token.image && token.imageUrl) {
        const img = new window.Image();
        img.src = token.imageUrl;
        img.onload = () => {
          // Update the token with the loaded image
          setTokens((prevTokens) =>
            prevTokens.map((t) =>
              t.id === token.id ? { ...t, image: img } : t
            )
          );
        };
      }
    });
  }, [tokens]);

  // // useEffect to update the position of a token from another client.
  useEffect(() => {
    if (socket) {
      socket.on("update-token-position-broadcast", (tokenData) => {
        const updatedTokens = tokens.map((t) =>
          t.id === tokenData.id ? { ...t, position: tokenData.position } : t
        );
        setTokens(updatedTokens);
      });

      // This will clean up the listener when the component unmounts so there is no memory leaks or unexpected
      // behavior.
      return () => {
        socket.off("update-token-position-broadcast");
      };
    }
  }, [socket, tokens]);

  // WIP for changing the tokens Size and and rotations will eventually add socket functionality when trans is working.
  useEffect(() => {
    if (selectedToken && transformerRef.current) {
      transformerRef.current.nodes([
        stageRef.current.findOne(`#${selectedToken.id}`),
      ]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedToken]);

  // Change the cursor style based on fog mode and edit mode
  useEffect(() => {
    if (stageRef.current) {
      if (mode === "edit" && showFogOfWar) {
        switch (fogMode) {
          case "spray":
            stageRef.current.container().style.cursor =
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewport='0 0 40 40' fill='none'><circle cx='20' cy='20' r='19' stroke='purple' stroke-width='2'/></svg>\"), auto";
            break;
          case "erase":
            stageRef.current.container().style.cursor =
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewport='0 0 40 40' fill='none'><circle cx='20' cy='20' r='19' stroke='red' stroke-width='2'/></svg>\"), auto";
            break;
          default:
            stageRef.current.container().style.cursor = "auto";
            break;
        }
      } else {
        stageRef.current.container().style.cursor = "auto";
      }
    }
  }, [mode, fogMode, showFogOfWar]);

  // Load the main image and set dimensions
  useEffect(() => {
    if (type === "image" && image) {
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
        });
        setTranslation({
          x: (window.innerWidth - scaledWidth) / 2,
          y: (window.innerHeight - scaledHeight) / 2,
        });
      };
    }
  }, [type, src, image]);

  const renderTokenUI = (token) => {
    return (
      selectedToken &&
      selectedToken.id === token.id &&
      !isDragging && (
        <>
          <Rect
            x={token.position.x + token.size}
            y={token.position.y}
            width={30}
            height={120}
            fill="grey"
            opacity={0.8}
            cornerRadius={5}
          />
          <KonvaImage
            image={editIcon}
            x={token.position.x + token.size + 5}
            y={token.position.y}
            width={20}
            height={20}
            onClick={() => {
              showInputField(
                token.position.x,
                token.position.y + token.size + 5,
                token.name
              );
            }}
            zIndex={1}
          />
          <KonvaImage
            image={deleteIcon}
            x={token.position.x + token.size + 5}
            y={token.position.y + 25}
            width={20}
            height={20}
            onClick={() => {
              removeToken(token.id);
              setSelectedToken(null);
            }}
            zIndex={1}
          />
          <KonvaImage
            image={bloodiedIcon}
            x={token.position.x + token.size + 5}
            y={token.position.y + 50}
            width={20}
            height={20}
            onClick={() => addTokenEffect("bloodied")}
            zIndex={1}
          />
          <KonvaImage
            image={deadIcon}
            x={token.position.x + token.size + 5}
            y={token.position.y + 75}
            width={20}
            height={20}
            onClick={() => addTokenEffect("dead")}
            zIndex={1}
          />
        </>
      )
    );
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

        {showFogOfWar && (
          <Button
            variant="contained"
            color="secondary"
            onClick={applyFogToEntireMap}
            sx={{ mt: 2 }}
          >
            Apply Fog to Entire Map
          </Button>
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

        <FormControlLabel
          control={
            <Checkbox checked={rulerActive} onChange={handleRulerToggle} />
          }
          label="Ruler Tool"
          sx={{ mt: 2 }}
        />

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
        <MapList />
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
        onClick={handleStageClick}
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
            {[...Array(Math.ceil(dimensions.width / gridSpacing)).keys()].map(
              (i) => (
                <Line
                  points={[
                    i * gridSpacing,
                    0,
                    i * gridSpacing,
                    dimensions.height,
                  ]}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1}
                  key={`v${i}`}
                />
              )
            )}
            {[...Array(Math.ceil(dimensions.height / gridSpacing)).keys()].map(
              (i) => (
                <Line
                  points={[
                    0,
                    i * gridSpacing,
                    dimensions.width,
                    i * gridSpacing,
                  ]}
                  stroke="rgba(255, 255, 255, 0.5)"
                  strokeWidth={1}
                  key={`h${i}`}
                />
              )
            )}
          </Layer>
        )}
        {showFogOfWar && (
          <Layer id="fogLayer" ref={fogLayerRef}>
            <KonvaImage
              image={fogCanvasRef.current} // Use the fog canvas as the source image
              width={dimensions.width}
              height={dimensions.height}
            />
          </Layer>
        )}
        <Layer id="tokenLayer">
          {tokens.map((token) => (
            <Group key={token.id}>
              <KonvaImage
                image={token.image}
                x={token.position.x}
                y={token.position.y}
                width={token.size}
                height={token.size}
                draggable
                onClick={() => handleTokenClick(token)}
                onDragStart={handleDragStart}
                onDragMove={(e) => handleDragMove(e, token)}
                onDragEnd={(e) => handleDragEnd(e, token)}
                onDblClick={() =>
                  showInputField(
                    token.position.x,
                    token.position.y + token.size + 5,
                    token.name
                  )
                }
              />

              {!isDragging && (
                <Text
                  text={token.name}
                  x={token.position.x}
                  y={token.position.y + token.size}
                  fontSize={14}
                  fill="white"
                  align="center"
                  width={token.size}
                />
              )}
              {renderTokenUI(token)}
            </Group>
          ))}
        </Layer>
        <Layer id="rulerLayer">
          {rulerStart && rulerEnd && (
            <>
              <Line
                points={[rulerStart.x, rulerStart.y, rulerEnd.x, rulerEnd.y]}
                stroke="red"
                strokeWidth={2}
              />
              <Text
                text={`${calculateDistance(rulerStart, rulerEnd)} ft`}
                x={(rulerStart.x + rulerEnd.x) / 2}
                y={(rulerStart.y + rulerEnd.y) / 2}
                fill="white"
              />
            </>
          )}
        </Layer>
      </Stage>

      {/* Hidden canvas used for fog of war */}
      <canvas
        ref={fogCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: "none" }}
      />

      {/* Input field for editing token name */}
      {inputVisible && (
        <input
          type="text"
          value={inputValue}
          onChange={handleEditTokenName}
          onBlur={handleInputBlur}
          style={{
            position: "absolute",
            top: inputPosition.y,
            left: inputPosition.x,
            zIndex: 25,
          }}
        />
      )}
    </Box>
  );
}

export default MapViewer;
