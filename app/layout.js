export const metadata = {
  metadataBase: new URL("https://arview.ihue.in"),
  title: "AR Product Viewer — see it in your own space",
  description:
    "Place a product in your room at true scale using your phone camera, or open the same link on a laptop to explore it in 3D with real-world dimensions.",
  applicationName: "AR Product Viewer",
  openGraph: {
    title: "AR Product Viewer — see it in your own space",
    description:
      "Point your phone at the floor and the machine appears at actual size. Share the link and anyone off site sees the same model in 3D.",
    url: "/",
    siteName: "AR Product Viewer",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AR Product Viewer — see it in your own space",
    description:
      "Place a product in your room at true scale from a phone browser. No app install.",
  },
};

export const viewport = {
  themeColor: "#0f1115",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        style={{
          margin: 0,
          overflowX: "hidden",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: "#0f1115",
          color: "#e8eaed",
        }}
      >
        {children}
      </body>
    </html>
  );
}
