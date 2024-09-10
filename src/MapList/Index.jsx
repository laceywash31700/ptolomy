import { useEffect, useState } from "react";
import { Tree } from "antd";
import { useMapTokenContext } from "../Map&TokenContext/Index";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";
import Button from "@mui/joy/Button";
import AspectRatio from "@mui/joy/AspectRatio";
import { useSocket } from "../SocketContext/Index";

export default function MapList() {
  const { maps, setSrc } = useMapTokenContext(); // Get maps from context
  const {socket} = useSocket();
  const [open, setOpen] = useState(false);
  const [gData, setGData] = useState([]);
  const [expandedKeys] = useState(["0-0", "0-0-0", "0-0-0-0"]);
  // console.log("this is the in the mapsList:", maps);

  const handleSrcChange = (src) => {
    setSrc(src);
    socket.emit("changing-src", {src});
    return src;
  }

  // Prepare the tree data based on the maps
  const mapData = maps.map((map) => ({
    title: (
      <AspectRatio variant="soft">
        <img
          src={map.asset}
          alt={map.id}
          style={{ maxWidth: "inherit" }}
          onClick={() => handleSrcChange(map.asset)}
        />
      </AspectRatio>
    ),
    key: map.id,
  }));

  const toggleDrawer = (inOpen) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen(inOpen);
  };

  const onDragEnter = (info) => {
    console.log(info);
    // expandedKeys, set it when controlled is needed
    // setExpandedKeys(info.expandedKeys)
  };

  const onDrop = (info) => {
    console.log(info);
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split("-");
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    

    // Find dragObject
    let dragObj;
    loop(mapData, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });
    if (!info.dropToGap) {
      // Drop on the content
      loop(mapData, dropKey, (item) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar = [];
      let i;
      loop(mapData, dropKey, (_item, index, arr) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        // Drop on the top of the drop node
        ar.splice(i, 0, dragObj);
      } else {
        // Drop on the bottom of the drop node
        ar.splice(i + 1, 0, dragObj);
      }
    }
    setGData(mapData);
  };

  useEffect(() => {
    if (socket) {
      socket.on("src-changes", (data) => {
        console.log("Received updated src from server:", data);
        // Handle the received src change
        setSrc(data.src); // Update state with the new src
      });
  
      return () => {
        socket.off("src-changes");
      };
    }
  }, [socket]);
  

  return (
    <Box sx={{ display: "flex" }}>
      <Button
        variant="outlined"
        color="primary"
        onClick={toggleDrawer(true)}
        sx={{
          mt: 2,
          color: "white",
          borderColor: "cyan",
          "&:hover": {
            backgroundColor: "neutral",
            color: "black",
            opacity: 0.3,
          },
        }}
      >
        Open drawer
      </Button>
      <Drawer open={open} onClose={toggleDrawer(false)} size={"sm"}>
        <Box role="presentation" onKeyDown={toggleDrawer(false)}>
          <Tree
            className="draggable-tree"
            defaultExpandedKeys={expandedKeys}
            draggable
            blockNode
            onDragEnter={onDragEnter}
            onDrop={onDrop}
            treeData={gData.length > 0 ? gData : mapData}
          />
        </Box>
      </Drawer>
    </Box>
  );
}
