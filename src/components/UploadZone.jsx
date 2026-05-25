import { useRef } from "react";

export default function UploadZone() {

  const inputRef = useRef();

  const handleClick = () => {
    inputRef.current.click();
  };

  const handleFile = (event) => {

    const file = event.target.files[0];

    if (!file) return;

    console.log("UPLOADED FILE:", file);

    alert(`Uploaded: ${file.name}`);
  };

  return (

    <div
      onClick={handleClick}
      className="border border-dashed border-violet-500/30 bg-white/[0.03] rounded-[32px] p-10 backdrop-blur-sm hover:border-violet-500/60 transition cursor-pointer group"
    >

      <input
        ref={inputRef}
        type="file"
        accept=".stl,.obj,.gltf,.glb"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex flex-col items-center justify-center text-center">

        <div className="w-24 h-24 rounded-3xl bg-violet-500/10 flex items-center justify-center text-violet-400 text-5xl mb-6 group-hover:scale-105 transition">

          ↑

        </div>

        <h2 className="text-3xl font-black">

          Drop your 3D files here

        </h2>

        <p className="text-white/60 mt-4 max-w-lg leading-relaxed">

          Upload STL, OBJ, STEP or GLTF files and receive instant manufacturing pricing in real time.

        </p>

      </div>

    </div>
  );
}