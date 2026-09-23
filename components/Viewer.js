"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const PRESETS = [
  {
    label: "Damaged Helmet (sample)",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
  },
  {
    label: "Toy Car (sample)",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ToyCar/glTF-Binary/ToyCar.glb",
  },
  {
    label: "Boom Box (sample)",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoomBox/glTF-Binary/BoomBox.glb",
  },
];

export default function Viewer() {
  const params = useSearchParams();
  const initial = params.get("src") || PRESETS[0].url;

  const [src, setSrc] = useState(initial);
  const [input, setInput] = useState(initial);
  const [dims, setDims] = useState(null);
  const [qr, setQr] = useState(null);
  const [shareMsg, setShareMsg] = useState("");
  const [ready, setReady] = useState(false);
  const mvRef = useRef(null);

  // Load the model-viewer web component in the browser only.
  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const shareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("src", src);
    return u.toString();
  }, [src]);

  // Read the model's real-world size once it has loaded.
  useEffect(() => {
    const el = mvRef.current;
    if (!el || !ready) return;
    const onLoad = () => {
      try {
        const d = el.getDimensions();
        setDims({
          x: d.x.toFixed(2),
          y: d.y.toFixed(2),
          z: d.z.toFixed(2),
        });
      } catch {
        setDims(null);
      }
    };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready, src]);

  // Regenerate the QR code whenever the model changes.
  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QR) => {
      QR.toDataURL(shareUrl(), { width: 220, margin: 1 }).then((data) => {
        if (!cancelled) setQr(data);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [shareUrl]);

  const load = (e) => {
    e.preventDefault();
    setDims(null);
    setSrc(input.trim());
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setShareMsg("Link copied");
    } catch {
      setShareMsg("Copy failed — select the link manually");
    }
    setTimeout(() => setShareMsg(""), 2500);
  };

  return (
    <main style={S.main}>
      <header style={S.header}>
        <h1 style={S.h1}>AR Product Viewer</h1>
        <p style={S.sub}>
          Place a machine in a real room at true scale, or send the link to someone off site.
        </p>
      </header>

      <form onSubmit={load} style={S.form}>
        <select
          value={PRESETS.some((p) => p.url === input) ? input : ""}
          onChange={(e) => {
            if (!e.target.value) return;
            setInput(e.target.value);
            setDims(null);
            setSrc(e.target.value);
          }}
          style={S.select}
        >
          <option value="">Choose a sample model…</option>
          {PRESETS.map((p) => (
            <option key={p.url} value={p.url}>
              {p.label}
            </option>
          ))}
        </select>

        <div style={S.row}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="…or paste the URL of any .glb file"
            style={S.input}
          />
          <button type="submit" style={S.btn}>
            Load
          </button>
        </div>
      </form>

      <div style={S.stage}>
        {ready ? (
          <model-viewer
            ref={mvRef}
            src={src}
            alt="3D model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="fixed"
            ar-placement="floor"
            camera-controls
            touch-action="pan-y"
            shadow-intensity="1"
            exposure="1"
            environment-image="neutral"
            style={{ width: "100%", height: "100%", background: "#13161c" }}
          >
            <button slot="ar-button" style={S.arBtn}>
              View in your room
            </button>
          </model-viewer>
        ) : (
          <div style={S.placeholder}>Loading 3D engine…</div>
        )}
      </div>

      <section style={S.panel}>
        <div style={S.card}>
          <h2 style={S.h2}>Real-world size</h2>
          {dims ? (
            <>
              <p style={S.dims}>
                {dims.x} m wide · {dims.z} m deep · {dims.y} m tall
              </p>
              <p style={S.note}>
                Measured from the model itself. AR places it at this exact scale, which is what
                tells a customer whether it fits.
              </p>
            </>
          ) : (
            <p style={S.note}>Loading model…</p>
          )}
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>Share this view</h2>
          {qr ? (
            <img src={qr} alt="QR code to open this model" style={S.qr} />
          ) : (
            <div style={{ height: 220 }} />
          )}
          <button onClick={copyShare} style={{ ...S.btn, width: "100%" }}>
            Copy link
          </button>
          <p style={S.note}>
            {shareMsg ||
              "Scan on a phone to open AR on site, or send the link to a technician or customer who is not there."}
          </p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>How AR works here</h2>
          <ul style={S.list}>
            <li>ARCore (Android) or ARKit (iOS) tracks the phone and finds the floor.</li>
            <li>The model is anchored to the spot you tap, so it stays put as you walk.</li>
            <li>
              <code>ar-scale=&quot;fixed&quot;</code> forbids resizing, so what you see is the true
              footprint.
            </li>
            <li>On desktop, drag to orbit — the AR button appears on a phone or tablet.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}

const S = {
  main: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px 64px" },
  header: { marginBottom: 20 },
  h1: { fontSize: 26, margin: "0 0 6px", fontWeight: 650, letterSpacing: "-0.01em" },
  sub: { margin: 0, color: "#9aa3af", fontSize: 15, lineHeight: 1.5 },
  form: { display: "grid", gap: 10, marginBottom: 16 },
  row: { display: "flex", gap: 8 },
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2a2f3a",
    background: "#171a21",
    color: "#e8eaed",
    fontSize: 15,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #2a2f3a",
    background: "#171a21",
    color: "#e8eaed",
    fontSize: 15,
    minWidth: 0,
  },
  btn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  stage: {
    height: "min(60vh, 520px)",
    borderRadius: 14,
    overflow: "hidden",
    border: "1px solid #2a2f3a",
    background: "#13161c",
    position: "relative",
  },
  placeholder: {
    display: "grid",
    placeItems: "center",
    height: "100%",
    color: "#9aa3af",
  },
  arBtn: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 22px",
    borderRadius: 999,
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  panel: {
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    marginTop: 16,
  },
  card: {
    border: "1px solid #2a2f3a",
    borderRadius: 14,
    padding: 16,
    background: "#141820",
  },
  h2: { fontSize: 15, margin: "0 0 10px", fontWeight: 600, color: "#e8eaed" },
  dims: { fontSize: 20, margin: "0 0 8px", fontWeight: 600 },
  note: { fontSize: 13, color: "#9aa3af", margin: "8px 0 0", lineHeight: 1.5 },
  qr: { width: 180, height: 180, borderRadius: 10, background: "#fff", padding: 8, display: "block", marginBottom: 10 },
  list: { margin: 0, paddingLeft: 18, fontSize: 13, color: "#9aa3af", lineHeight: 1.7 },
};
