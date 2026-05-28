import {
  useDropzone,
} from "react-dropzone";

const UploadZone = ({
  onFileUpload,
  compact = false,
}) => {

  const handleDrop = (
    acceptedFiles
  ) => {

    if (
      acceptedFiles.length === 0
    ) {

      return;

    }

    const uploadedFile =
      acceptedFiles[0];

    if (
      typeof onFileUpload ===
      "function"
    ) {

      onFileUpload(
        uploadedFile
      );

    }

  };

  const {
    getRootProps,
    getInputProps,
  } = useDropzone({

    onDrop: handleDrop,

    multiple: false,

    accept: {

      "model/stl": [
        ".stl",
      ],

      "model/obj": [
        ".obj",
      ],

      "application/octet-stream": [
        ".stl",
        ".obj",
      ],

    },

  });

  return (

    <div
      {...getRootProps()}
      className={`

      ${compact

        ? `
          w-[74px]
          h-[74px]
          rounded-3xl
          flex
          items-center
          justify-center
          bg-violet-500/10
          border
          border-violet-500/20
          backdrop-blur-xl
          hover:bg-violet-500/20
          transition-all
          cursor-pointer
        `

        : `
          border
          border-dashed
          border-white/10
          rounded-[42px]
          min-h-[320px]
          flex
          items-center
          justify-center
          cursor-pointer
          transition
          bg-black/20
          backdrop-blur-xl
        `
      }
      `}
    >

      <input
        {...getInputProps()}
      />

      {compact ? (

        <div className="text-violet-400 text-4xl">

          ↑

        </div>

      ) : (

        <div className="text-center">

          <div
            className="
            w-24
            h-24
            rounded-3xl
            bg-violet-500/10
            border
            border-violet-500/20
            flex
            items-center
            justify-center
            mx-auto
            text-violet-400
            text-5xl
            "
          >

            ↑

          </div>

          <h2
            className="
            mt-10
            text-6xl
            font-black
            "
          >

            Upload Your
            <span className="text-violet-400">

              {" "}3D Files

            </span>

          </h2>

          <p
            className="
            mt-6
            text-white/50
            text-lg
            "
          >

            Supports STL and OBJ files for instant manufacturing analysis.

          </p>

        </div>

      )}

    </div>

  );

};

export default UploadZone;