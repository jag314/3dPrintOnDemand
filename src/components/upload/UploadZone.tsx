"use client";

import { useDropzone } from "react-dropzone";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
}

export default function UploadZone({
  onFileUpload,
}: UploadZoneProps) {

  const { getRootProps, getInputProps, isDragActive } = useDropzone({

    multiple: false,

    accept: {
      "model/stl": [".stl"],
      "model/gltf+json": [".gltf"],
      "model/gltf-binary": [".glb"],
      "application/octet-stream": [".stl"],
    },

    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        onFileUpload(file);
      }
    },
  });

  return (

    <div
      {...getRootProps()}
      className={`
        border border-dashed rounded-3xl p-16
        cursor-pointer transition-all duration-300
        bg-white/[0.02]
        hover:border-purple-500/50
        hover:bg-purple-500/5
        ${isDragActive ? "border-purple-500 bg-purple-500/10" : "border-white/10"}
      `}
    >

      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center text-center">

        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center text-4xl text-purple-400 mb-6">
          ↑
        </div>

        <h3 className="text-3xl font-bold">
          Drop your 3D files here
        </h3>

        <p className="mt-4 text-white/60 max-w-lg leading-relaxed">
          Upload STL, GLTF or GLB files to instantly preview your model.
        </p>

      </div>

    </div>
  );
}