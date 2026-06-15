import { useRef, useState } from "react";

export function ThemeToggleCircular({ children, onToggle, speed = 0.5, blur = 0 }) {
  const ref = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleClick = async (e) => {
    if (isTransitioning) return;

    if (!document.startViewTransition) {
      onToggle?.();
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    setIsTransitioning(true);
    document.documentElement.setAttribute("data-theme-transition", "");

    try {
      const transition = document.startViewTransition(() => {
        onToggle?.();
      });

      await transition.ready;

      const blurPx = blur > 0 ? `blur(${blur}px)` : "none";

      const keyframes = {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      };
      if (blur > 0) keyframes.filter = ["none", blurPx, "none"];

      document.documentElement.animate(
        keyframes,
        {
          duration: speed * 1000,
          easing: "ease-in",
          pseudoElement: "::view-transition-new(root)",
        }
      );

      await transition.finished;
    } finally {
      document.documentElement.removeAttribute("data-theme-transition");
      setIsTransitioning(false);
    }
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      style={{ pointerEvents: isTransitioning ? "none" : undefined, display: "contents" }}
    >
      {children}
    </div>
  );
}
