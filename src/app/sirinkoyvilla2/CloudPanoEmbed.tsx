"use client";

import { useEffect } from "react";

const EMBED_ID = "O36i7SP5a";
const SCRIPT_SRC = "https://app.cloudpano.com/public/shareScript.js";

export default function CloudPanoEmbed() {
  useEffect(() => {
    const container = document.getElementById(EMBED_ID);

    if (!container) {
      return;
    }

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.short = EMBED_ID;
    script.dataset.path = "tours";
    script.dataset.isSelfHosted = "false";
    script.setAttribute("width", "100%");
    script.setAttribute("height", "500px");

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      id={EMBED_ID}
      className="min-h-[500px] w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-[0_24px_120px_rgba(0,0,0,0.45)]"
    />
  );
}
