import { useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  PenTool,
  Wrench,
  Paperclip,
  X,
  CheckCircle,
} from "lucide-react";

const ALLOWED_EXTS = new Set([
  "jpg", "jpeg", "png", "gif", "webp",
  "stl", "obj", "3mf",
  "pdf",
]);
const MAX_FILE_BYTES = 50 * 1024 * 1024;

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 outline-none text-white focus:border-violet-500 transition-all";

const Contact = () => {
  const fileInputRef = useRef(null);

  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [empresa,  setEmpresa]  = useState("");
  const [servicio, setServicio] = useState("Impresión 3D");
  const [mensaje,  setMensaje]  = useState("");
  const [files,    setFiles]    = useState([]);

  // "idle" | "sending" | "success" | "error"
  const [status,   setStatus]   = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleFileChange(e) {
    const incoming = Array.from(e.target.files || []);
    e.target.value = "";

    const fileErrors = [];
    const valid = [];

    for (const f of incoming) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXTS.has(ext)) {
        fileErrors.push(`"${f.name}": tipo no permitido (.${ext})`);
        continue;
      }
      if (f.size > MAX_FILE_BYTES) {
        fileErrors.push(`"${f.name}": supera 50 MB`);
        continue;
      }
      valid.push(f);
    }

    setFiles((prev) => {
      const next = [...prev, ...valid].slice(0, 5);
      return next;
    });

    if (fileErrors.length) {
      setErrorMsg(fileErrors.join("\n"));
      setStatus("error");
    } else if (status === "error" && errorMsg) {
      setStatus("idle");
      setErrorMsg("");
    }
  }

  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nombre.trim())  { setErrorMsg("Por favor ingresá tu nombre.");    setStatus("error"); return; }
    if (!email.trim())   { setErrorMsg("Por favor ingresá tu correo.");     setStatus("error"); return; }
    if (!mensaje.trim()) { setErrorMsg("Por favor escribí tu mensaje.");    setStatus("error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("El correo no parece válido.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("nombre",   nombre.trim());
    fd.append("email",    email.trim());
    fd.append("empresa",  empresa.trim());
    fd.append("servicio", servicio);
    fd.append("mensaje",  mensaje.trim());
    for (const f of files) fd.append("attachments", f);

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res  = await fetch(`${apiBase}/api/contact`, { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(body.error || `Error ${res.status}. Intentá de nuevo.`);
        setStatus("error");
        return;
      }

      setStatus("success");
      setNombre(""); setEmail(""); setEmpresa(""); setServicio("Impresión 3D");
      setMensaje(""); setFiles([]);
    } catch {
      setErrorMsg("No se pudo conectar con el servidor. Verificá tu conexión.");
      setStatus("error");
    }
  }

  return (
    <main className="section-background min-h-screen pt-40 pb-32 px-6 relative overflow-hidden">

      <div className="section-glow" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto">
          <p className="uppercase tracking-[0.35em] text-violet-400 text-sm">
            CONTACTO INITY 3D
          </p>
          <h1 className="text-6xl lg:text-7xl font-black leading-[0.95] mt-8">
            Hagamos Algo
            <br />
            <span className="text-violet-400">Extraordinario</span>
          </h1>
          <p className="soft-text text-xl leading-relaxed mt-10">
            Ya sea que necesités manufactura, programas educativos, diseño de producto o servicios de mantenimiento, INITY 3D está listo para ayudarte a dar vida a tus ideas.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-12 mt-24">

          {/* LEFT SIDE — FORM */}
          <div className="glass-card rounded-[42px] p-10">
            <h2 className="text-4xl font-black">Envianos un Mensaje</h2>
            <p className="soft-text mt-4 leading-relaxed">
              Contanos sobre tu proyecto, institución o idea y te respondemos pronto.
            </p>

            {/* SUCCESS STATE */}
            {status === "success" ? (
              <div className="mt-10 flex flex-col items-center gap-6 text-center py-10">
                <CheckCircle size={56} className="text-violet-400" />
                <h3 className="text-2xl font-bold">¡Mensaje enviado!</h3>
                <p className="soft-text leading-relaxed">
                  Recibimos tu consulta y te responderemos a <span className="text-violet-400">{email || "tu correo"}</span> a la brevedad.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setEmail(""); }}
                  className="primary-button px-8 py-4 rounded-2xl text-sm font-semibold mt-2"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="mt-10 space-y-6" onSubmit={handleSubmit} noValidate>

                {/* NAME */}
                <div>
                  <label className="block text-white/70 mb-3">Nombre Completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-white/70 mb-3">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>

                {/* COMPANY */}
                <div>
                  <label className="block text-white/70 mb-3">
                    Institución / Empresa
                    <span className="text-white/30 ml-2 text-sm">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* SERVICE */}
                <div>
                  <label className="block text-white/70 mb-3">Tipo de Servicio</label>
                  <select
                    value={servicio}
                    onChange={(e) => setServicio(e.target.value)}
                    className={inputClass}
                  >
                    <option className="bg-[#111827]" value="Impresión 3D">Impresión 3D</option>
                    <option className="bg-[#111827]" value="Programas Educativos">Programas Educativos</option>
                    <option className="bg-[#111827]" value="Necesito un Diseñador">Necesito un Diseñador</option>
                    <option className="bg-[#111827]" value="Desarrollo de Producto">Desarrollo de Producto</option>
                    <option className="bg-[#111827]" value="Mantenimiento y Reparación">Mantenimiento y Reparación</option>
                    <option className="bg-[#111827]" value="Otro">Otro</option>
                  </select>
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="block text-white/70 mb-3">Detalles del Proyecto</label>
                  <textarea
                    rows="6"
                    placeholder="Cuéntanos sobre tu proyecto..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className={`${inputClass} resize-none`}
                    required
                  />
                </div>

                {/* ATTACHMENTS */}
                <div>
                  <label className="block text-white/70 mb-3">
                    Archivos adjuntos
                    <span className="text-white/30 ml-2 text-sm">(opcional · máx. 5 · 50 MB c/u)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.stl,.obj,.3mf,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={files.length >= 5}
                    className="flex items-center gap-3 w-full rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-6 py-4 text-white/50 hover:border-violet-500/50 hover:text-white/70 hover:bg-white/[0.04] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Paperclip size={18} />
                    <span className="text-sm">
                      {files.length >= 5
                        ? "Máximo 5 archivos"
                        : "Adjuntar imagen, modelo 3D o PDF"}
                    </span>
                  </button>

                  {/* Accepted types hint */}
                  <p className="text-white/30 text-xs mt-2 px-1">
                    JPG · PNG · GIF · WEBP · STL · OBJ · 3MF · PDF
                  </p>

                  {/* File list */}
                  {files.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {files.map((f, i) => (
                        <li
                          key={`${f.name}-${i}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip size={14} className="text-violet-400 shrink-0" />
                            <span className="text-sm text-white/80 truncate">{f.name}</span>
                            <span className="text-xs text-white/30 shrink-0">{formatBytes(f.size)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            aria-label={`Quitar ${f.name}`}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ERROR MESSAGE */}
                {status === "error" && errorMsg && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300 whitespace-pre-line">
                    {errorMsg}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="primary-button w-full py-5 rounded-2xl text-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Enviando..." : "Enviar Mensaje"}
                </button>

              </form>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">

            {/* CONTACT INFO */}
            <div className="glass-card rounded-[42px] p-10">
              <h2 className="text-4xl font-black">Información de Contacto</h2>
              <div className="space-y-8 mt-10">

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Mail className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white/50">Correo</p>
                    <h3 className="text-xl font-semibold">contact@inity3d.com</h3>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Phone className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white/50">WhatsApp</p>
                    <h3 className="text-xl font-semibold">+506 7290-4402</h3>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <MapPin className="text-violet-400" />
                  </div>
                  <div>
                    <p className="text-white/50">Ubicación</p>
                    <h3 className="text-xl font-semibold">Costa Rica</h3>
                  </div>
                </div>

              </div>
            </div>

            {/* SERVICES */}
            <div className="glass-card rounded-[42px] p-10">
              <h2 className="text-4xl font-black">Lo Que Ofrecemos</h2>
              <div className="grid sm:grid-cols-2 gap-6 mt-10">

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">
                  <img
                    src="/materials/3d-printer.png"
                    alt="Impresora 3D"
                    width={34}
                    height={34}
                    style={{ objectFit: "contain", filter: "invert(72%) sepia(40%) saturate(600%) hue-rotate(215deg) brightness(110%)" }}
                  />
                  <h3 className="text-xl font-bold mt-5">Impresión 3D</h3>
                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">
                  <GraduationCap className="text-violet-400" size={34} />
                  <h3 className="text-xl font-bold mt-5">Programas Educativos</h3>
                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">
                  <PenTool className="text-violet-400" size={34} />
                  <h3 className="text-xl font-bold mt-5">Diseño y Modelado</h3>
                </div>

                <div className="rounded-3xl border border-white/10 p-6 bg-white/[0.03]">
                  <Wrench className="text-violet-400" size={34} />
                  <h3 className="text-xl font-bold mt-5">Mantenimiento</h3>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
};

export default Contact;
