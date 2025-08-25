import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import GalleryCard from "./GalleryCard";
export default function GalleryGrid({ items, onOpen }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id,title,description,image_url,author,tags,likes_count")
        .order("created_at", { ascending: false });

      if (!error) setImages(data || []);
    })();
  }, []);
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
      {images.map((img) => (
        <GalleryCard
          key={img.id}
          item={img}
          onOpen={(id) => console.log("Open", id)}
          enableRealtime={true} // opzionale
        />
      ))}
    </section>
  );
}
