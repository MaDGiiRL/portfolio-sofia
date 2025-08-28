import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router"; // se usi React Router DOM: import { Link } from "react-router-dom"
import GalleryFilters from "../components/gallery/GalleryFilters";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Lightbox from "../components/gallery/Lightbox";
import useSupabaseGallery from "../hooks/useSupabaseGallery";
import { Home } from "lucide-react";

// normalizza stringhe: minuscole + rimozione accenti + trim
const norm = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

export default function GalleryPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const [currentId, setCurrentId] = useState(null);

  const { images, loading, error } = useSupabaseGallery();

  // elenco tag con "all", ordinato
  const tags = useMemo(() => {
    const set = new Set();
    images.forEach((i) => (i.tags || []).forEach((x) => x && set.add(x)));
    return ["all", ...Array.from(set).sort()];
  }, [images]);

  // filtro su titolo/descrizione/autore/tag (case + accent insensitive)
  const filtered = useMemo(() => {
    const q = norm(query);
    return images.filter((i) => {
      const passTag = tag === "all" || (i.tags || []).includes(tag);

      const haystack = norm(
        [
          i.title ?? "",
          i.description ?? "",
          i.author ?? "",
          ...(i.tags || []).map((t) => `#${t}`),
        ].join(" ")
      );

      const passQuery =
        q === "" || q.split(/\s+/).every((w) => haystack.includes(w));

      return passTag && passQuery;
    });
  }, [images, query, tag]);

  // Se cambio i filtri e l'elemento aperto non è più nel subset, chiudo la lightbox
  useEffect(() => {
    if (currentId && !filtered.some((x) => x.id === currentId)) {
      setCurrentId(null);
    }
  }, [filtered, currentId]);

  // lightbox handlers sul subset filtrato
  const openById = (id) => setCurrentId(id);
  const close = () => setCurrentId(null);
  const gotoPrev = () => {
    const idx = filtered.findIndex((x) => x.id === currentId);
    if (idx < 0) return;
    const prev = (idx - 1 + filtered.length) % filtered.length;
    setCurrentId(filtered[prev].id);
  };
  const gotoNext = () => {
    const idx = filtered.findIndex((x) => x.id === currentId);
    if (idx < 0) return;
    const next = (idx + 1) % filtered.length;
    setCurrentId(filtered[next].id);
  };

  return (
    <div className="gallery-page">
      <style>{`
        :root{
          --accent-pink:#ff36a3;
          --accent-yellow:#dbff00;
          --bg-900:#0b0b0e;
          --panel-stroke: rgba(255,255,255,.12);
          --text:#e5e7eb; --muted:#a7aab3;
          --radius:16px;
        }
        .gallery-page{ min-height:100vh; background:var(--bg-900); color:var(--text); }
        .g-header{ position:sticky; top:0; z-index:2; background:rgba(15,15,20,.65); backdrop-filter:blur(8px); border-bottom:1px solid var(--panel-stroke); }
        .g-header .bar{ max-width:1280px; margin:0 auto; padding:14px clamp(12px,3vw,20px); display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        .g-title{ font-weight:800; letter-spacing:.3px; font-size:clamp(1.15rem,2.6vw,1.6rem); margin-right:auto; }
        .g-btn{ background:var(--accent-yellow); color:#111; border:1px solid rgba(219,255,0,.4); font-weight:800; border-radius:12px; padding:.55rem .9rem; }
        .g-btn:hover{ filter:brightness(1.05); }
        .g-container{ max-width:1280px; margin:0 auto; padding: clamp(16px,3vw,28px); }
        .g-empty{ padding:28px; border:1px dashed var(--panel-stroke); border-radius:16px; text-align:center; color:var(--muted); }
      `}</style>

      <header className="g-header">
        <div className="bar">
          <div className="g-title">
            <span style={{ color: "var(--accent-pink)" }}>MaD</span>Gallery
          </div>
          {/* <GalleryFilters
            query={query}
            onQuery={setQuery}
            tag={tag}
            onTag={setTag}
            tags={tags}
          /> */}
          <Link to="/" className="btn btn-dark btn-icon" aria-label="Home">
            <Home size={20} />
          </Link>
        </div>
      </header>

      <main className="g-container" role="main">
        {error && <div className="g-empty">Errore: {error}</div>}
        {!error && loading && <div className="g-empty">Caricamento…</div>}
        {!error && !loading && filtered.length === 0 && (
          <div className="g-empty">
            Nessuna immagine trovata con i filtri attuali.
          </div>
        )}
        {!error && !loading && filtered.length > 0 && (
          <GalleryGrid items={filtered} onOpen={openById} />
        )}
      </main>

      {currentId && (
        <Lightbox
          items={filtered} // navigazione sul subset filtrato
          currentId={currentId}
          onClose={close}
          onPrev={gotoPrev}
          onNext={gotoNext}
        />
      )}
    </div>
  );
}
