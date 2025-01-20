import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { mapRef } from "../Firebase/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { addDoc } from "firebase/firestore";
import { mapsCollection, } from "../Firebase/firebase";
import { v4 as uuidv4 } from "uuid";
import { useMapTokenContext } from "../Map&TokenContext/Index";

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
  const { maps, setMaps } = useMapTokenContext();
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];

    try {
      const uid = uuidv4();
      const asset = `${file.name}-${uid}`
      const imageRef = ref(mapRef, asset);
      await uploadBytes(imageRef, file);
      const storageUrl = await getDownloadURL(imageRef);
      console.log('this is the image Url:', storageUrl);
      // ========= This is where we want to write the code to store the image ref for this map ===============
      await addDoc( mapsCollection , {
        asset: storageUrl,
      });
      // =======================================================================================================
      console.log("Uploaded map");
    } catch (error) {
      console.error("Error uploading file", error);
    }
  }, [maps]);

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
