"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Expand, LayoutPanelLeft, MapPinned, Minimize2 } from "lucide-react";

import type { TourData, TourLinkHotspot, TourSceneData } from "@/lib/tour-data";

declare global {
  interface Window {
    Marzipano?: any;
  }
}

type ViewerSceneRecord = {
  data: TourSceneData;
  scene: any;
  view: any;
};

const scriptCache = new Map<string, Promise<void>>();
const cubeFaces = ["b", "d", "f", "l", "r", "u"];

function loadScript(src: string): Promise<void> {
  const cached = scriptCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-src="${src}"]`);

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing ?? document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.src = src;

    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Script yüklenemedi: ${src}`));

    if (!existing) {
      document.head.appendChild(script);
    }
  });

  scriptCache.set(src, promise);
  return promise;
}

function stopTouchAndScrollEventPropagation(element: HTMLElement) {
  [
    "touchstart",
    "touchmove",
    "touchend",
    "touchcancel",
    "wheel",
    "mousewheel",
  ].forEach((eventName) => {
    element.addEventListener(eventName, (event) => event.stopPropagation());
  });
}

type VillaV2ViewerProps = {
  assetBase: string;
  projectLabel: string;
  tourData: TourData;
};

export default function VillaV2Viewer({
  assetBase,
  projectLabel,
  tourData,
}: VillaV2ViewerProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const panoRef = useRef<HTMLDivElement | null>(null);
  const switchSceneRef = useRef<(id: string) => void>(() => {});
  const [activeSceneId, setActiveSceneId] = useState(tourData.scenes[0]?.id ?? "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sceneIndexById = useMemo(() => {
    const map = new Map<string, number>();
    tourData.scenes.forEach((scene, index) => map.set(scene.id, index));
    return map;
  }, [tourData.scenes]);

  const activeScene = useMemo(
    () => tourData.scenes.find((scene) => scene.id === activeSceneId) ?? tourData.scenes[0],
    [activeSceneId, tourData.scenes],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 900px)");

    const syncViewport = () => {
      setIsCompact(mediaQuery.matches);
      setIsMobileMenuOpen(false);
    };

    syncViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", syncViewport);
      return () => mediaQuery.removeEventListener("change", syncViewport);
    }

    mediaQuery.addListener(syncViewport);
    return () => mediaQuery.removeListener(syncViewport);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let preloadTimer: number | null = null;
    let preloadActive = 0;
    const preloadedAssets = new Set<string>();
    const preloadQueue: string[] = [];
    const sceneDataById = new Map(tourData.scenes.map((scene) => [scene.id, scene]));

    function buildSceneAssetList(sceneData: TourSceneData, maxLevels: number) {
      const urls = [`${assetBase}/tiles/${sceneData.id}/preview.jpg`];
      let loadedLevels = 0;
      let z = 1;

      sceneData.levels.forEach((level) => {
        if (level.fallbackOnly || loadedLevels >= maxLevels) {
          return;
        }

        const tilesPerAxis = Math.ceil(level.size / level.tileSize);
        cubeFaces.forEach((face) => {
          for (let y = 0; y < tilesPerAxis; y += 1) {
            for (let x = 0; x < tilesPerAxis; x += 1) {
              urls.push(`${assetBase}/tiles/${sceneData.id}/${z}/${face}/${y}/${x}.jpg`);
            }
          }
        });

        loadedLevels += 1;
        z += 1;
      });

      return urls;
    }

    function preloadImage(url: string, done: () => void) {
      const image = new Image();
      let settled = false;
      const timeoutId = window.setTimeout(finalize, 12000);

      function finalize() {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        image.onload = null;
        image.onerror = null;
        done();
      }

      image.onload = finalize;
      image.onerror = finalize;
      image.src = url;
      if (image.complete) {
        window.setTimeout(finalize, 0);
      }
    }

    function enqueueAsset(url: string) {
      if (preloadedAssets.has(url)) {
        return;
      }
      preloadedAssets.add(url);
      preloadQueue.push(url);
    }

    function enqueueSceneAssets(sceneData: TourSceneData, maxLevels: number) {
      buildSceneAssetList(sceneData, maxLevels).forEach(enqueueAsset);
    }

    function pumpPreloadQueue() {
      const concurrency = window.matchMedia("(max-width: 900px)").matches ? 2 : 4;

      while (preloadActive < concurrency && preloadQueue.length) {
        preloadActive += 1;
        const nextUrl = preloadQueue.shift();

        if (!nextUrl) {
          preloadActive -= 1;
          return;
        }

        preloadImage(nextUrl, () => {
          preloadActive -= 1;
          pumpPreloadQueue();
        });
      }
    }

    function schedulePreloadPump() {
      if (preloadTimer) {
        window.clearTimeout(preloadTimer);
      }

      preloadTimer = window.setTimeout(() => {
        preloadTimer = null;
        pumpPreloadQueue();
      }, window.matchMedia("(max-width: 900px)").matches ? 450 : 220);
    }

    function queueScenePrefetch(sceneData: TourSceneData) {
      const compact = window.matchMedia("(max-width: 900px)").matches;
      const linkedSceneIds = new Set<string>();

      enqueueSceneAssets(sceneData, compact ? 1 : 2);

      sceneData.linkHotspots.forEach((hotspot) => {
        const targetSceneData = sceneDataById.get(hotspot.target);
        if (!targetSceneData || linkedSceneIds.has(targetSceneData.id)) {
          return;
        }

        linkedSceneIds.add(targetSceneData.id);
        enqueueSceneAssets(targetSceneData, 1);

        targetSceneData.linkHotspots.forEach((nextHotspot) => {
          const nextSceneData = sceneDataById.get(nextHotspot.target);
          if (nextSceneData) {
            enqueueSceneAssets(nextSceneData, 0);
          }
        });
      });

      tourData.scenes.forEach((scene) => enqueueSceneAssets(scene, 0));
      schedulePreloadPump();
    }

    async function initialize() {
      try {
        setStatus("loading");
        setErrorMessage(null);

        await loadScript(`${assetBase}/vendor/marzipano.js`);
        if (cancelled || !panoRef.current || !window.Marzipano) {
          return;
        }

        const Marzipano = window.Marzipano;
        const viewer = new Marzipano.Viewer(panoRef.current, {
          controls: {
            mouseViewMode: tourData.settings.mouseViewMode ?? "drag",
          },
        });

        const sceneRecords: Record<string, ViewerSceneRecord> = {};

        const createLinkHotspotElement = (hotspot: TourLinkHotspot) => {
          const targetSceneData = sceneDataById.get(hotspot.target);
          const wrapper = document.createElement("button");
          wrapper.type = "button";
          wrapper.setAttribute("aria-label", `${targetSceneData?.name ?? "Sahne"} sahnesine gec`);
          wrapper.style.display = "inline-flex";
          wrapper.style.alignItems = "center";
          wrapper.style.gap = "10px";
          wrapper.style.padding = "10px 14px";
          wrapper.style.border = "1px solid rgba(255,255,255,0.18)";
          wrapper.style.borderRadius = "999px";
          wrapper.style.background = "rgba(8,12,18,0.72)";
          wrapper.style.backdropFilter = "blur(14px)";
          wrapper.style.color = "#f8fafc";
          wrapper.style.cursor = "pointer";
          wrapper.style.boxShadow = "0 14px 30px rgba(0,0,0,0.28)";

          const dot = document.createElement("span");
          dot.style.width = "10px";
          dot.style.height = "10px";
          dot.style.borderRadius = "999px";
          dot.style.background = "#fb7185";
          dot.style.boxShadow = "0 0 0 6px rgba(251,113,133,0.18)";

          const label = document.createElement("span");
          label.style.fontSize = "12px";
          label.style.fontWeight = "600";
          label.style.letterSpacing = "0.04em";
          label.style.textTransform = "uppercase";
          label.textContent = targetSceneData?.name ?? "Gecis";

          wrapper.appendChild(dot);
          wrapper.appendChild(label);
          wrapper.addEventListener("click", () => switchSceneRef.current(hotspot.target));
          stopTouchAndScrollEventPropagation(wrapper);
          return wrapper;
        };

        tourData.scenes.forEach((sceneData) => {
          const source = Marzipano.ImageUrlSource.fromString(
            `${assetBase}/tiles/${sceneData.id}/{z}/{f}/{y}/{x}.jpg`,
            { cubeMapPreviewUrl: `${assetBase}/tiles/${sceneData.id}/preview.jpg` },
          );

          const geometry = new Marzipano.CubeGeometry(sceneData.levels);
          const limiter = Marzipano.RectilinearView.limit.traditional(
            sceneData.faceSize,
            (100 * Math.PI) / 180,
            (120 * Math.PI) / 180,
          );
          const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);
          const scene = viewer.createScene({
            source,
            geometry,
            view,
            pinFirstLevel: true,
          });

          sceneData.linkHotspots.forEach((hotspot) => {
            scene.hotspotContainer().createHotspot(createLinkHotspotElement(hotspot), {
              yaw: hotspot.yaw,
              pitch: hotspot.pitch,
            });
          });

          sceneRecords[sceneData.id] = {
            data: sceneData,
            scene,
            view,
          };
        });

        const switchSceneById = (sceneId: string) => {
          const nextScene = sceneRecords[sceneId];
          if (!nextScene) {
            return;
          }

          nextScene.view.setParameters(nextScene.data.initialViewParameters);
          nextScene.scene.switchTo();
          setActiveSceneId(sceneId);
          queueScenePrefetch(nextScene.data);
        };

        switchSceneRef.current = switchSceneById;
        if (tourData.scenes[0]) {
          switchSceneById(tourData.scenes[0].id);
        }

        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Viewer baslatilamadi.");
      }
    }

    initialize();

    return () => {
      cancelled = true;
      switchSceneRef.current = () => {};
      if (preloadTimer) {
        window.clearTimeout(preloadTimer);
      }
    };
  }, [assetBase, tourData]);

  async function toggleFullscreen() {
    if (!shellRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await shellRef.current.requestFullscreen();
  }

  return (
    <div
      ref={shellRef}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(190,24,93,0.22),_transparent_34%),linear-gradient(180deg,_#02050a_0%,_#050814_56%,_#020305_100%)] text-white"
    >
      <div className="grid min-h-screen lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-30 w-[86vw] max-w-[320px] border-r border-white/10 bg-black/70 backdrop-blur-2xl transition-transform duration-300 lg:static lg:w-auto lg:max-w-none",
            isCompact ? (isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
          ].join(" ")}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-white/8 px-5 pb-5 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-rose-200/70">
                    TypeScript Viewer
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold text-white">{projectLabel}</h1>
                </div>
                {isCompact ? (
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
                Mevcut `villa` tur asset&apos;leriyle calisan yeni route. Ilk sahne aninda acilir,
                sonraki muhtemel odalar arka planda isitilir.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/45">Sahne</div>
                  <div className="mt-2 text-lg font-semibold text-white">{tourData.scenes.length}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-white/45">Durum</div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {status === "ready" ? "Hazir" : status === "loading" ? "Yukleniyor" : "Hata"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-2">
                {tourData.scenes.map((scene, index) => {
                  const isActive = scene.id === activeScene?.id;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => {
                        switchSceneRef.current(scene.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={[
                        "w-full rounded-2xl border px-4 py-4 text-left transition",
                        isActive
                          ? "border-rose-400/40 bg-rose-500/12 shadow-[0_18px_40px_rgba(244,63,94,0.14)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">{scene.name}</div>
                        </div>
                        <div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
                          {scene.linkHotspots.length} bag
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/8 p-4">
              <div className="flex gap-2">
                <Link
                  href="/3dtour/villa"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white/80 transition hover:bg-white/10"
                >
                  Eski Tur
                </Link>
                <Link
                  href="/"
                  className="flex-1 rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-center text-sm font-medium text-rose-100 transition hover:bg-rose-500/18"
                >
                  Ana Sayfa
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,113,133,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.12),_transparent_26%)]" />

          <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              {isCompact ? (
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                >
                  <LayoutPanelLeft className="h-4 w-4" />
                </button>
              ) : null}

              <div className="rounded-full border border-white/10 bg-black/45 px-4 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Aktif Sahne</div>
                <div className="mt-1 text-sm font-semibold text-white">{activeScene?.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/55 shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:block">
                {sceneIndexById.get(activeScene?.id ?? "") !== undefined
                  ? `${String((sceneIndexById.get(activeScene?.id ?? "") ?? 0) + 1).padStart(2, "0")} / ${String(tourData.scenes.length).padStart(2, "0")}`
                  : `00 / ${String(tourData.scenes.length).padStart(2, "0")}`}
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white shadow-[0_10px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="absolute inset-0">
            <div ref={panoRef} className="h-full w-full" />
          </div>

          {status !== "ready" ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#020307]/80 backdrop-blur-md">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-rose-300" />
                <div className="mt-4 text-xs uppercase tracking-[0.28em] text-white/45">Viewer Yukleniyor</div>
                <div className="mt-2 text-sm text-white/70">
                  {status === "error" ? errorMessage : "TypeScript tabanli tur baslatiliyor..."}
                </div>
              </div>
            </div>
          ) : null}

          <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-3 rounded-[28px] border border-white/10 bg-black/42 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/60">
                <MapPinned className="h-3.5 w-3.5" />
                Yeni Route
              </div>
              <div className="text-sm text-white/72">
                Bu sayfa eski HTML export yerine React state, TypeScript veri modeli ve arka plan
                prefetch akisiyla calisiyor.
              </div>
            </div>
          </div>

          {isCompact && isMobileMenuOpen ? (
            <button
              type="button"
              aria-label="Menuyu kapat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 z-20 bg-black/45 backdrop-blur-[2px] lg:hidden"
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
