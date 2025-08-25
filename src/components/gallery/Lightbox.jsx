import React, { useEffect, useMemo, useRef } from "react";

export default function Lightbox({
  items,
  currentId,
  onClose,
  onPrev,
  onNext,
}) {
  const current = useMemo(
    () => items.find((x) => x.id === currentId),
    [items, currentId]
  );
  const overlayRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onPrev, onNext]);

  if (!current) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${current.title} - anteprima immagine`}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1080,
        background: "rgba(0,0,0,.75)",
        display: "grid",
        placeItems: "center",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="lb-inner"
        style={{
          width: "min(92vw, 1100px)",
          background: "rgba(10,10,14,.9)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 18,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          className="lb-close"
          onClick={onClose}
          aria-label="Chiudi anteprima"
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "#fff",
            width: 40,
            height: 40,
            borderRadius: 10,
          }}
        >
          ✕
        </button>

        <button
          className="lb-nav lb-prev"
          onClick={onPrev}
          aria-label="Immagine precedente"
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            left: 8,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          ←
        </button>

        <button
          className="lb-nav lb-next"
          onClick={onNext}
          aria-label="Immagine successiva"
          style={{
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            right: 8,
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,.1)",
            border: "1px solid rgba(255,255,255,.2)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          →
        </button>

        <figure
          className="lb-figure"
          style={{
            margin: 0,
            padding: 0,
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
        >
          <img
            src={current.image_url}
            alt={current.title}
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "min(70vh, 820px)",
              objectFit: "contain",
              background: "#0b0b0e",
              display: "block",
            }}
          />
          <figcaption
            style={{
              padding: "12px 14px 14px",
              borderTop: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.03)",
            }}
          >
            <div
              className="lb-title"
              style={{ fontWeight: 800, color: "#fff", marginBottom: ".15rem" }}
            >
              {current.title}
            </div>
            <div className="lb-desc" style={{ color: "#d7dae3" }}>
              {current.description}
            </div>
            <div
              className="lb-author"
              style={{
                color: "#aeb2bd",
                fontSize: ".9rem",
                marginTop: ".2rem",
              }}
            >
              by {current.author || "—"}
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
