# ARview — AR product viewer

Place a 3D product model in a real room at true scale from a phone, or share the same
link with someone off site who sees it as an interactive 3D model.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

```bash
npx vercel --prod
```

Accept the defaults. Vercel detects Next.js automatically and returns a public URL.

## How to demo

1. Open the URL on an Android phone in Chrome (or an iPhone in Safari).
2. Tap **View in your room**.
3. Point at the floor, move the phone slowly until it detects the plane, then tap to place.
4. Walk around the model — it stays anchored, at real size.

Share the link and a desktop viewer gets the 3D model plus the real-world dimensions.
The QR code on the page opens the same view on a phone.

## Loading your own model

Paste any public `.glb` URL into the input box. The URL updates with `?src=…`, so the
link you share carries the model with it.

For real products, the pipeline is: CAD (STEP / SolidWorks) → decimate and strip internals
→ apply PBR materials → export GLB (Android / web) and USDZ (iOS) → compress with Draco.

## Files

| File | What it is |
| --- | --- |
| `app/layout.js` | Wraps every page — html, body, theme. Renders once, persists across navigation. |
| `app/page.js` | The route at `/`. A server component; wraps the viewer in a Suspense boundary. |
| `components/Viewer.js` | The client component: model loading, AR, dimensions, QR, share link. |
