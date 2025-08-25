import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient";
import GalleryCard from "./GalleryCard";
import Lightbox from "./Lightbox";

export default function GalleryGrid({ items }) {
  const [images, setImages] = useState([]);
  const [currentId, setCurrentId] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,title,description,image_url,author,tags,likes_count,created_at")
        .order("created_at", { ascending: false });

      if (!error) setImages(data || []);
    })();
  }, []);

  const open = useCallback((id) => setCurrentId(id), []);
  const close = useCallback(() => setCurrentId(null), []);

  const goPrev = useCallback(() => {
    if (!currentId || images.length === 0) return;
    const idx = images.findIndex((x) => x.id === currentId);
    const prevIdx = (idx - 1 + images.length) % images.length;
    setCurrentId(images[prevIdx]?.id ?? null);
  }, [currentId, images]);

  const goNext = useCallback(() => {
    if (!currentId || images.length === 0) return;
    const idx = images.findIndex((x) => x.id === currentId);
    const nextIdx = (idx + 1) % images.length;
    setCurrentId(images[nextIdx]?.id ?? null);
  }, [currentId, images]);

  return (
    <section className="g-grid" aria-label="Elenco immagini">
      <style>{`
        .g-grid {
          display: grid;
          gap: 14px;
          margin-top: 14px;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 576px){ .g-grid{ grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 992px){ .g-grid{ grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1200px){ .g-grid{ grid-template-columns: repeat(4, 1fr); } }

        /* --- Hover zoom dell'immagine nella card --- */
        .g-card .g-thumb img { transition: transform .45s ease; }
        .g-card:hover .g-thumb img { transform: scale(1.05); }
        .g-card:focus-within .g-thumb img { transform: scale(1.05); }
      `}</style>

      {images.map((img) => (
        <GalleryCard
          key={img.id}
          item={img}
          onOpen={open}       
          enableRealtime={true}
        />
      ))}

      {currentId && (
        <Lightbox
          items={images}
          currentId={currentId}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  );
}
