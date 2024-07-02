import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const baseStyle = {
    border: '2px dashed #2196f3', // Highlighted border by default
    borderRadius: '5px',
    padding: '20px',
    textAlign: 'center',
    transition: 'border .24s ease-in-out'
  };
  
  const activeStyle = {
    border: '2px solid #2196f3', // More prominent border when active
  };
  
function DragAndDrop() {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error("Error uploading file", error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/webp, video/mp4, video/webm",
  });

  return (
    <div {...getRootProps()} style={{ ...baseStyle, ...(isDragActive ? activeStyle : {}) }}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop files here, or click to select files</p>
    </div>
  );
}

export default DragAndDrop;
