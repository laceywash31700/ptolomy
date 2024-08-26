import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { tokenRef } from "../firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const baseStyle = {
  border: "2px dashed #00e676", // Different color for differentiation
  borderRadius: "5px",
  padding: "20px",
  textAlign: "center",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  border: "2px solid #00e676",
};

function Tokens() {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    try {
      const asset = `${file.name}-${uuidv4()}`;
      const imageRef = ref(tokenRef, asset);
      await uploadBytes(imageRef, file);
      // ========= This is where we want to write the code to store the image ref for this token ===============
      const docRef = await addDoc(collection(db, "tokens"), {
        asset: asset,
      });
      console.log("document written with ID:", docRef.id);
      // =======================================================================================================
      console.log("Uploaded Token");
    } catch (error) {
      console.error("Error uploading file", error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/jpeg, image/png, image/webp",
  });

  return (
    <div
      {...getRootProps()}
      style={{ ...baseStyle, ...(isDragActive ? activeStyle : {}) }}
    >
      <input {...getInputProps()} />
      <p>Drag 'n' drop token files here, or click to select files</p>
    </div>
  );
}

export default Tokens;
