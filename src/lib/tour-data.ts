import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

export interface TourLevel {
  tileSize: number;
  size: number;
  fallbackOnly?: boolean;
}

export interface TourViewParameters {
  yaw: number;
  pitch: number;
  fov: number;
}

export interface TourLinkHotspot {
  yaw: number;
  pitch: number;
  rotation: number;
  target: string;
}

export interface TourInfoHotspot {
  yaw: number;
  pitch: number;
  title: string;
  text: string;
}

export interface TourSceneData {
  id: string;
  name: string;
  levels: TourLevel[];
  faceSize: number;
  initialViewParameters: TourViewParameters;
  linkHotspots: TourLinkHotspot[];
  infoHotspots: TourInfoHotspot[];
}

export interface TourSettings {
  mouseViewMode?: string;
  autorotateEnabled?: boolean;
  fullscreenButton?: boolean;
  viewControlButtons?: boolean;
}

export interface TourData {
  name?: string;
  scenes: TourSceneData[];
  settings: TourSettings;
}

export async function loadPublicTourData(publicTourPath: string): Promise<TourData> {
  const filePath = path.join(process.cwd(), "public", publicTourPath, "data.js");
  const source = await readFile(filePath, "utf8");
  const sandbox: { APP_DATA?: TourData; __TOUR_DATA__?: TourData } = {};

  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.__TOUR_DATA__ = APP_DATA;`, sandbox);

  if (!sandbox.__TOUR_DATA__) {
    throw new Error(`Tour data could not be parsed: ${publicTourPath}`);
  }

  return sandbox.__TOUR_DATA__;
}
