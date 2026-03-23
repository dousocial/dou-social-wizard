import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/3dtour/sirinkoyvilla",
        destination: "/3dtour/sirinkoyvilla/index.html",
      },
      {
        source: "/3dtour/ikizvilla",
        destination: "/3dtour/ikizvilla/index.html",
      },
      {
        source: "/3dtour/villa",
        destination: "/3dtour/villa/index.html",
      },
    ];
  },
};

export default nextConfig;
