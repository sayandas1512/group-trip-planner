"use client";
import { useEffect, useState } from "react";

export default function ShareLink({ tripId }: { tripId: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}/trip/${tripId}`);
  }, [tripId]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) -- the input below
      // is readOnly + select-on-focus so it can still be copied manually.
    }
  }

  return (
    <section className="card floating share-box">
      <h2 className="section-title">🔗 Share this trip</h2>
      <p>Send this link to everyone in the group so they can add their preferences.</p>
      <div className="share-row">
        <input readOnly value={url} onFocus={(e) => e.target.select()} />
        <button type="button" onClick={handleCopy}>
          {copied ? "Copied! ✓" : "Copy link"}
        </button>
      </div>
    </section>
  );
}
