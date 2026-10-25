import type { ReactNode } from "react";

/** Avatares prediseñados (originales) con temática de programación. */
interface Preset {
  id: string;
  name: string;
  bg: [string, string];
  art: ReactNode;
}

const S = { fill: "none", stroke: "#fff", strokeWidth: 4, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const AVATARS: Preset[] = [
  { id: "terminal", name: "Terminal", bg: ["#0b3d91", "#19d3ff"], art: <g {...S}><path d="M18 24l10 8-10 8" /><path d="M32 42h14" /></g> },
  { id: "tags", name: "Etiquetas", bg: ["#5b1a8f", "#ff4fd8"], art: <g {...S}><path d="M24 20 12 32l12 12M40 20l12 12-12 12M35 16l-6 32" /></g> },
  { id: "braces", name: "Llaves", bg: ["#0a5c47", "#2bff9a"], art: <g {...S}><path d="M26 16c-6 0-6 4-6 8s0 6-5 8c5 2 5 4 5 8s0 8 6 8M38 16c6 0 6 4 6 8s0 6 5 8c-5 2-5 4-5 8s0 8-6 8" /></g> },
  { id: "lambda", name: "Lambda", bg: ["#7a3b00", "#ffb23f"], art: <g {...S}><path d="M20 16h6l18 32M32 30 20 48" /></g> },
  { id: "chip", name: "Chip", bg: ["#123a4a", "#4fd1c5"], art: <g {...S}><rect x="20" y="20" width="24" height="24" rx="3" /><path d="M26 14v6M32 14v6M38 14v6M26 44v6M32 44v6M38 44v6M14 26h6M14 32h6M14 38h6M44 26h6M44 32h6M44 38h6" /><rect x="27" y="27" width="10" height="10" rx="1" fill="#fff" /></g> },
  { id: "robot", name: "Robot", bg: ["#3b2a8f", "#7aa2f7"], art: <g {...S}><rect x="16" y="22" width="32" height="24" rx="6" /><path d="M32 14v8M24 46v4M40 46v4" /><circle cx="25" cy="33" r="3" fill="#fff" /><circle cx="39" cy="33" r="3" fill="#fff" /><path d="M27 40h10" /></g> },
  { id: "rocket", name: "Cohete", bg: ["#8f1a3a", "#ff3d6e"], art: <g {...S}><path d="M32 12c8 6 10 16 6 28H26c-4-12-2-22 6-28z" /><circle cx="32" cy="26" r="3" fill="#fff" /><path d="M26 40l-6 6 2-10M38 40l6 6-2-10M30 46l2 6 2-6" /></g> },
  { id: "bug", name: "Bug", bg: ["#2d4a0b", "#a3e635"], art: <g {...S}><ellipse cx="32" cy="36" rx="9" ry="12" /><path d="M32 24v24M26 20l3 5M38 20l-3 5M23 32h-8M23 40l-7 4M41 32h8M41 40l7 4M24 28l-7-4M40 28l7-4" /></g> },
  { id: "headphones", name: "Auriculares", bg: ["#4a2a12", "#ff9a3d"], art: <g {...S}><path d="M16 38v-6a16 16 0 0 1 32 0v6" /><rect x="13" y="36" width="9" height="14" rx="3" /><rect x="42" y="36" width="9" height="14" rx="3" /></g> },
  { id: "planet", name: "Planeta", bg: ["#1a2a6b", "#b47bff"], art: <g {...S}><circle cx="32" cy="32" r="11" /><ellipse cx="32" cy="32" rx="22" ry="7" transform="rotate(-20 32 32)" /></g> },
  { id: "key", name: "Tecla", bg: ["#3a3f47", "#c9d6e2"], art: <g {...S}><rect x="14" y="16" width="36" height="32" rx="6" /><rect x="20" y="20" width="24" height="18" rx="3" /><path d="M28 29h8" /></g> },
  { id: "binary", name: "Binario", bg: ["#003b1f", "#39ff6a"], art: <g fill="#fff" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="13" textAnchor="middle"><text x="32" y="26">1010</text><text x="32" y="40">0110</text><text x="32" y="54" opacity="0.6">1101</text></g> },
];

export function AvatarArt({ preset, size }: { preset: Preset; size: number }) {
  const gid = `av-${preset.id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={preset.bg[0]} />
          <stop offset="1" stopColor={preset.bg[1]} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill={`url(#${gid})`} />
      {preset.art}
    </svg>
  );
}

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/**
 * Avatar del usuario. `value`: "" (iniciales), "preset:<id>" o "img:<dataURL>".
 */
export function Avatar({ value, name, size = 104, online = false }: { value: string; name: string; size?: number; online?: boolean }) {
  const preset = value.startsWith("preset:") ? AVATARS.find((a) => a.id === value.slice(7)) : undefined;
  const img = value.startsWith("img:") ? value.slice(4) : null;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {img ? <img src={img} alt="" /> : preset ? <AvatarArt preset={preset} size={size} /> : initialsOf(name)}
      {online && <span className="online" />}
    </div>
  );
}

/** Recorta al centro y reduce una imagen a 256×256 JPEG (pesa poco para guardar en el navegador). */
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function fileToAvatar(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) return Promise.reject(new Error("Formato no soportado (usá PNG, JPG, WebP o GIF)"));
  if (file.size > MAX_IMAGE_BYTES) return Promise.reject(new Error("La imagen supera los 10 MB"));
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      if (im.width > 12000 || im.height > 12000) {
        URL.revokeObjectURL(url);
        reject(new Error("La imagen es demasiado grande"));
        return;
      }
      const side = Math.min(im.width, im.height);
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      g.drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, 0, 0, 256, 256);
      URL.revokeObjectURL(url);
      // se re-codifica desde el canvas: se descartan metadatos (EXIF, ubicación GPS) y cualquier contenido extra
      resolve("img:" + c.toDataURL("image/jpeg", 0.85));
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    im.src = url;
  });
}

/** Selector: foto propia, iniciales o uno de los prediseñados. */
export function AvatarPicker({ value, name, onChange }: { value: string; name: string; onChange: (v: string) => void }) {
  return (
    <div className="av-picker">
      <label className={`av-opt upload ${value.startsWith("img:") ? "on" : ""}`} title="Subir una foto">
        {value.startsWith("img:") ? <img src={value.slice(4)} alt="" /> : <span>+ Foto</span>}
        <input
          type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              onChange(await fileToAvatar(f));
            } catch (err) {
              alert((err as Error).message);
            }
          }}
        />
      </label>
      <button type="button" className={`av-opt initials ${value === "" ? "on" : ""}`} onClick={() => onChange("")} title="Iniciales">
        {initialsOf(name)}
      </button>
      {AVATARS.map((a) => (
        <button type="button" key={a.id} className={`av-opt ${value === "preset:" + a.id ? "on" : ""}`} onClick={() => onChange("preset:" + a.id)} title={a.name}>
          <AvatarArt preset={a} size={52} />
        </button>
      ))}
    </div>
  );
}
