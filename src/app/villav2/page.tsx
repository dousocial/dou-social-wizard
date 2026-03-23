import type { Metadata } from "next";

import VillaV2Viewer from "./villa-v2-viewer";
import { loadPublicTourData } from "@/lib/tour-data";

export const metadata: Metadata = {
  title: "Villa V2 | Dou Social",
  description: "TypeScript tabanli modern villa tur deneyimi",
};

export default async function VillaV2Page() {
  const tourData = await loadPublicTourData("3dtour/villa");

  return (
    <VillaV2Viewer
      assetBase="/3dtour/villa"
      projectLabel="Villa V2"
      tourData={tourData}
    />
  );
}
