import {
  useDropzone,
} from "react-dropzone";

const UploadZone = (props) => {

  console.log(
    "UPLOADZONE PROPS:",
    props
  );

  const handleDrop = (
    acceptedFiles
  ) => {

    console.log(
      "FILES RECEIVED:",
      acceptedFiles
    );

    if (
      acceptedFiles.length === 0
    ) {

      console.log(
        "NO FILES"
      );

      return;

    }

    const uploadedFile =
      acceptedFiles[0];

    console.log(
      "UPLOADED FILE:",
      uploadedFile
    );

    // =========================
    // IMPORTANT
    // =========================

    if (
      typeof props.onFileUpload ===
      "function"
    ) {

      console.log(
        "CALLING onFileUpload"
      );

      props.onFileUpload(
        uploadedFile
      );

    }

    else {

      console.log(
        "onFileUpload IS NOT A FUNCTION"
      );

    }

  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({

    onDrop: handleDrop,

    multiple: false,

    accept: {

      "application/sla": [
        ".stl",
      ],

      "application/octet-stream":
        [".stl"],

      "model/stl": [
        ".stl",
      ],

    },

  });

  return (

    <div
      {...getRootProps()}
      className={`border border-dashed rounded-3xl min-h-[260px] flex items-center justify-center cursor-pointer transition

      ${isDragActive

        ? "border-violet-500 bg-violet-500/10"

        : "border-white/10 bg-white/[0.02]"

      }`}
    >

      <input
        {...getInputProps()}
      />

      <div className="text-center">

        <div className="w-20 h-20 rounded-3xl bg-violet-500/10 flex items-center justify-center mx-auto text-violet-400 text-5xl">

          ↑

        </div>

        <h2 className="mt-8 text-5xl font-black text-white">

          Drop your 3D files here

        </h2>

        <p className="mt-4 text-white/50 max-w-lg">

          Upload STL files to preview your model instantly.

        </p>

      </div>

    </div>

  );

};

export default UploadZone;