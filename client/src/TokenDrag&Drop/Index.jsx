import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { tokenRef } from "../Firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, tokensCollection } from "../Firebase/firebase";
import { useMapTokenContext } from "../Map&TokenContext/Index";

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
  const { tokens, setTokens } = useMapTokenContext();
  const onDrop = useCallback(async (acceptedFiles) => {
  const file = acceptedFiles[0];

    try {
      const uid = uuidv4();
      const asset = `${file.name}-${uid}`;
      const imageRef = ref(tokenRef, asset);
      await uploadBytes(imageRef, file);
      const storageUrl = await getDownloadURL(imageRef); 
      console.log('this is the image Url:', storageUrl);
      // ========= This is where we want to write the code to store the image ref for this token ===============
      await addDoc( tokensCollection , {
        asset: storageUrl,
      });
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
