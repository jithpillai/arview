"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

const BASE =
  "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models";

// Everyday objects whose real size you already know, so the AR scale reads as correct.
// `height` is the object's true height in metres; the viewer normalises the model to it.
const PRESETS = [
  { label: "Sofa — 0.85 m tall, 2.2 m wide", url: `${BASE}/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb`, height: "0.85" },
  { label: "Armchair — 0.9 m tall", url: `${BASE}/SheenChair/glTF-Binary/SheenChair.glb`, height: "0.9" },
  { label: "Floor lantern — 1.2 m tall", url: `${BASE}/Lantern/glTF-Binary/Lantern.glb`, height: "1.2" },
  { label: "Helmet — 0.35 m tall", url: `${BASE}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`, height: "0.35" },
  { label: "Water bottle — 0.25 m tall", url: `${BASE}/WaterBottle/glTF-Binary/WaterBottle.glb`, height: "0.25" },
];

// Typical real-world heights, so the demo can show a machine-sized object.
const SIZE_PRESETS = [
  { label: "Actual file size", value: "" },
  { label: "Desktop unit — 0.5 m tall", value: "0.5" },
  { label: "Small compressor — 1.2 m tall", value: "1.2" },
  { label: "Industrial compressor — 1.8 m tall", value: "1.8" },
  { label: "Large plant unit — 2.5 m tall", value: "2.5" },
];

export default function Viewer() {
  const params = useSearchParams();
  const initial = params.get("src") || PRESETS[0].url;
  const initialHeight = params.get("h") || (params.get("src") ? "" : PRESETS[0].height);

  const [src, setSrc] = useState(initial);
  const [input, setInput] = useState(initial);
  const [natural, setNatural] = useState(null); // size as authored, in metres
  const [targetHeight, setTargetHeight] = useState(initialHeight);
  const [qr, setQr] = useState(null);
  const [shareMsg, setShareMsg] = useState("");
  const [ready, setReady] = useState(false);
  const mvRef = useRef(null);

  // Scale factor that turns the authored size into the real-world size.
  const scale =
    natural && targetHeight && Number(targetHeight) > 0
      ? Number(targetHeight) / natural.y
      : 1;

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
    if (targetHeight) u.searchParams.set("h", targetHeight);
    else u.searchParams.delete("h");
    return u.toString();
  }, [src, targetHeight]);

  // Capture the model's authored size once it has loaded.
  useEffect(() => {
    const el = mvRef.current;
    if (!el || !ready) return;
    const onLoad = () => {
      try {
        const d = el.getDimensions();
        setNatural({ x: d.x, y: d.y, z: d.z });
      } catch {
        setNatural(null);
      }
    };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready, src]);

  // Regenerate the QR code whenever the shared view changes.
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
    setNatural(null);
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

  const shown = natural
    ? {
        x: (natural.x * scale).toFixed(2),
        y: (natural.y * scale).toFixed(2),
        z: (natural.z * scale).toFixed(2),
      }
    : null;

  const tiny = natural && natural.y * scale < 0.25;

  return (
    <main style={S.main}>
      <header style={S.header}>
        <h1 style={S.h1}>AR Product Viewer</h1>
        <p style={S.sub}>
          Place a machine in a real room at true scale, or share the same link with someone off
          site.
        </p>
      </header>

      <form onSubmit={load} style={S.form}>
        <select
          value={PRESETS.some((p) => p.url === input) ? input : ""}
          onChange={(e) => {
            if (!e.target.value) return;
            const preset = PRESETS.find((p) => p.url === e.target.value);
            setInput(e.target.value);
            setNatural(null);
            setSrc(e.target.value);
            if (preset) setTargetHeight(preset.height);
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

        <div style={S.row}>
          <select
            value={SIZE_PRESETS.some((p) => p.value === targetHeight) ? targetHeight : ""}
            onChange={(e) => setTargetHeight(e.target.value)}
            style={{ ...S.select, flex: 1 }}
          >
            {SIZE_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            value={targetHeight}
            onChange={(e) => setTargetHeight(e.target.value)}
            placeholder="height in m"
            inputMode="decimal"
            style={{ ...S.input, maxWidth: 130 }}
          />
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
            scale={`${scale} ${scale} ${scale}`}
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
          {shown ? (
            <>
              <p style={S.dims}>
                {shown.x} m wide · {shown.z} m deep · {shown.y} m tall
              </p>
              <p style={S.note}>
                {targetHeight
                  ? `Scaled to ${targetHeight} m tall. AR places it at exactly this size.`
                  : "Size as authored in the file."}
              </p>
              {tiny && (
                <p style={{ ...S.note, color: "#f0b429" }}>
                  This model is authored at a few centimetres, so it will look tiny in AR. Pick a
                  real-world height above — that is the same normalisation a CAD-to-AR pipeline has
                  to do, because exports disagree about units.
                </p>
              )}
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
            <div style={{ height: 180 }} />
          )}
          <button onClick={copyShare} style={{ ...S.btn, width: "100%" }}>
            Copy link
          </button>
          <p style={S.note}>
            {shareMsg ||
              "The link carries the model and its size, so a technician or customer off site sees exactly this."}
          </p>
        </div>

        <div style={S.card}>
          <h2 style={S.h2}>How AR works here</h2>
          <ul style={S.list}>
            <li>ARCore (Android) or ARKit (iOS) tracks the phone and finds the floor.</li>
            <li>The model anchors to the spot you tap, so it stays put as you walk around it.</li>
            <li>
              <code>ar-scale=&quot;fixed&quot;</code> forbids pinch-to-resize, so the footprint you
              see is the real one.
            </li>
            <li>Move the phone slowly at first — plane detection needs texture and light.</li>
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
  placeholder: { display: "grid", placeItems: "center", height: "100%", color: "#9aa3af" },
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
  card: { border: "1px solid #2a2f3a", borderRadius: 14, padding: 16, background: "#141820" },
  h2: { fontSize: 15, margin: "0 0 10px", fontWeight: 600, color: "#e8eaed" },
  dims: { fontSize: 20, margin: "0 0 8px", fontWeight: 600 },
  note: { fontSize: 13, color: "#9aa3af", margin: "8px 0 0", lineHeight: 1.5 },
  qr: {
    width: 180,
    height: 180,
    borderRadius: 10,
    background: "#fff",
    padding: 8,
    display: "block",
    marginBottom: 10,
  },
  list: { margin: 0, paddingLeft: 18, fontSize: 13, color: "#9aa3af", lineHeight: 1.7 },
};
