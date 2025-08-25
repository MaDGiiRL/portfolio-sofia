import React from "react";
import GalleryCard from "./GalleryCard";

export default function GalleryGrid({ items, onOpen }) {
  return (
    <section className="g-grid" aria-label="Elenco immagini">
      <style>{`
        .g-grid {
          display: grid;
          gap: 14px;
          margin-top: 14px;
          grid-template-columns: repeat(1, 1fr); /* Mobile */
        }
        @media (min-width: 576px){ .g-grid{ grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 992px){ .g-grid{ grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px){ .g-grid{ grid-template-columns: repeat(4, 1fr); } }
      `}</style>
      {items.map((it) => (
        <GalleryCard key={it.id} item={it} onOpen={onOpen} />
      ))}
    </section>
  );
}
