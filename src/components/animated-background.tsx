export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {/* base radial wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.9_0.19_122/0.18),transparent_70%),radial-gradient(ellipse_60%_50%_at_100%_100%,oklch(0.55_0.18_280/0.18),transparent_60%)]" />

      {/* animated grid */}
      <div className="absolute inset-0 grid-lines opacity-40 animate-bg-pan" />

      {/* drifting aurora blobs */}
      <div
        className="aurora"
        style={{
          top: "-10%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          background:
            "radial-gradient(circle at 30% 30%, oklch(0.9 0.19 122 / 0.55), transparent 60%)",
          animationDuration: "22s",
        }}
      />
      <div
        className="aurora"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          background:
            "radial-gradient(circle at 70% 70%, oklch(0.6 0.2 300 / 0.5), transparent 60%)",
          animationDuration: "28s",
          animationDelay: "-6s",
        }}
      />
      <div
        className="aurora"
        style={{
          top: "30%",
          left: "40%",
          width: "40vw",
          height: "40vw",
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.72 0.17 200 / 0.4), transparent 60%)",
          animationDuration: "32s",
          animationDelay: "-12s",
        }}
      />

      {/* twinkling stars */}
      <div className="absolute inset-0 opacity-70 stars-layer" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_100%)]" />
    </div>
  );
}
