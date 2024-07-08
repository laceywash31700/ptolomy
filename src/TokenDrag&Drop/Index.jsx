import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const baseStyle = {
  border: '2px dashed #00e676', // Different color for differentiation
  borderRadius: '5px',
  padding: '20px',
  textAlign: 'center',
  transition: 'border .24s ease-in-out'
};

const activeStyle = {
  border: '2px solid #00e676',
};

function Tokens() {
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
    
        const formData = new FormData();
        formData.append("file", file);
    
        try {
          const response = await axios.post("/uploadToken", formData, {
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
    accept: "image/jpeg, image/png, image/webp"
  });

  return (
    <div {...getRootProps()} style={{ ...baseStyle, ...(isDragActive ? activeStyle : {}) }}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop token files here, or click to select files</p>
    </div>
  );
}

export default Tokens;
