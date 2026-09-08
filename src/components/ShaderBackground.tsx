"use client";

import { useEffect, useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

/**
 * The living WebGL hero gradient. Rendered once and pinned behind the first
 * three scroll panes (see ParallaxStage). Mounted-guarded so the three.js
 * canvas never runs during SSR, and faded in on first paint.
 */
export default function ShaderBackground() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="absolute inset-0 bg-black">
      {mounted && (
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <ShaderGradientCanvas
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            pixelDensity={1}
            fov={45}
            lazyLoad={false}
          >
            <ShaderGradient
              animate="on"
              type="sphere"
              brightness={0.8}
              cAzimuthAngle={270}
              cDistance={0.5}
              cPolarAngle={180}
              cameraZoom={15.09}
              color1="#73bfc4"
              color2="#ff810a"
              color3="#8da0ce"
              envPreset="city"
              grain="on"
              lightType="env"
              positionX={-0.1}
              positionY={0}
              positionZ={0}
              reflection={0.4}
              rotationX={0}
              rotationY={130}
              rotationZ={70}
              uAmplitude={3.2}
              uDensity={0.8}
              uFrequency={5.5}
              uSpeed={0.3}
              uStrength={0.3}
              range="disabled"
              rangeStart={0}
              rangeEnd={40}
            />
          </ShaderGradientCanvas>
        </div>
      )}
    </div>
  );
}
