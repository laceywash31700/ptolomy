import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { mapRef } from "../firebase/firebase";
import { ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { v4 as uuidv4 } from "uuid";

const baseStyle = {
  border: "2px dashed #2196f3", // Highlighted border by default
  borderRadius: "5px",
  padding: "20px",
  textAlign: "center",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  border: "2px solid #2196f3", // More prominent border when active
};

function DragAndDrop() {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    try {
      const asset = `${file.name}-${uuidv4()}`
      const imageRef = ref(mapRef, asset);
      await uploadBytes(imageRef, file);
      // ========= This is where we want to write the code to store the image ref for this map ===============
      const docRef = await addDoc(collection(db, "maps"), {
        asset: asset,
      });
      console.log("document written with ID:", docRef.id);
      // =======================================================================================================
      console.log("Uploaded map");
    } catch (error) {
      console.error("Error uploading file", error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/webp, video/mp4, video/webm",
  });

  return (
    <div
      {...getRootProps()}
      style={{ ...baseStyle, ...(isDragActive ? activeStyle : {}) }}
    >
      <input {...getInputProps()} />
      <p>Drag 'n' drop map files here, or click to select files</p>
    </div>
  );
}

export default DragAndDrop;
