/** Parallax leve só na camada da imagem (recortada pelo .portal-app-bg). */

const LERP = 0.07;
const MAX_MOUSE_PX = 8;
const MAX_TILT_PX = 6;

/**
 * @param {number} current
 * @param {number} target
 */
function lerp(current, target) {
  return current + (target - current) * LERP;
}

/**
 * @param {HTMLElement} root
 */
export function initPortalBgParallax(root = document.querySelector(".portal-app-bg")) {
  if (!(root instanceof HTMLElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let rafId = 0;
  let pointerActive = false;

  function applyShift() {
    current.x = lerp(current.x, target.x);
    current.y = lerp(current.y, target.y);
    root.style.setProperty("--portal-bg-shift-x", `${current.x.toFixed(2)}px`);
    root.style.setProperty("--portal-bg-shift-y", `${current.y.toFixed(2)}px`);

    const settled =
      Math.abs(current.x - target.x) < 0.05 && Math.abs(current.y - target.y) < 0.05;
    if (!settled || pointerActive) {
      rafId = requestAnimationFrame(applyShift);
    } else {
      rafId = 0;
    }
  }

  function scheduleFrame() {
    if (!rafId) rafId = requestAnimationFrame(applyShift);
  }

  function setTarget(x, y) {
    target.x = x;
    target.y = y;
    scheduleFrame();
  }

  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch") return;
        const nx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
        const ny = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
        pointerActive = true;
        setTarget(nx * MAX_MOUSE_PX, ny * MAX_MOUSE_PX);
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerleave",
      () => {
        pointerActive = false;
        setTarget(0, 0);
      },
      { passive: true }
    );
  }

  /** @param {DeviceOrientationEvent} e */
  function onOrientation(e) {
    const gamma = e.gamma;
    const beta = e.beta;
    if (gamma == null || beta == null) return;
    const nx = Math.max(-1, Math.min(1, gamma / 45));
    const ny = Math.max(-1, Math.min(1, (beta - 45) / 45));
    setTarget(nx * MAX_TILT_PX, ny * MAX_TILT_PX);
  }

  if (typeof DeviceOrientationEvent !== "undefined") {
    const needsPermission =
      typeof DeviceOrientationEvent.requestPermission === "function";

    if (!needsPermission) {
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
    } else if (!finePointer) {
      const askOnce = () => {
        document.removeEventListener("touchstart", askOnce);
        DeviceOrientationEvent.requestPermission()
          .then((state) => {
            if (state === "granted") {
              window.addEventListener("deviceorientation", onOrientation, { passive: true });
            }
          })
          .catch(() => {});
      };
      document.addEventListener("touchstart", askOnce, { once: true, passive: true });
    }
  }
}
