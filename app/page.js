import { Suspense } from "react";
import Viewer from "../components/Viewer";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading viewer…</div>}>
      <Viewer />
    </Suspense>
  );
}
