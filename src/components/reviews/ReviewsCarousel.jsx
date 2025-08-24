// /src/components/ReviewsCarousel.jsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import supabase from "../../supabase/supabase-client";

export default function ReviewsCarousel({
  limit = 10,
  subjectType = "site",
  subjectId = null,
}) {
  const [items, setItems] = useState([]);
  const trackRef = useRef(null);

  // === Drag state ===
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  useEffect(() => {
    (async () => {
      let q = supabase
        .from("reviews")
        .select("id, display_name, rating, comment, created_at", {
          count: "exact",
        })
        .eq("approved", true)
        .eq("subject_type", subjectType)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (subjectType !== "site" && subjectId) {
        q = q.eq("subject_id", subjectId);
      }

      const { data, error } = await q;
      if (!error) setItems(data || []);
      else console.error("Errore fetch reviews:", error);
    })();
  }, [limit, subjectType, subjectId]);

  // === Pointer (mouse/touch/pen) drag-to-scroll ===
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      el.classList.add("is-dragging");
      // per compat touch/mouse/pen uso clientX
      startXRef.current = e.clientX;
      startScrollLeftRef.current = el.scrollLeft;
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current) return;
      e.preventDefault(); // evita selezione testo/scroll verticale cattivo
      const dx = e.clientX - startXRef.current;
      el.scrollLeft = startScrollLeftRef.current - dx;
    };

    const endDrag = (e) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      el.classList.remove("is-dragging");
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", endDrag, { passive: true });
    el.addEventListener("pointerleave", endDrag, { passive: true });
    el.addEventListener("pointercancel", endDrag, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointerleave", endDrag);
      el.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  return (
    <section className="container my-5">
      <style>{`
        .rev-header{ display:flex; align-items:center; gap:12px; }
        .rev-actions{ margin-left:auto; display:flex; gap:8px; }
        .rev-track{
          display:grid; grid-auto-flow:column; grid-auto-columns:minmax(280px, 360px);
          gap:16px; overflow:auto; scroll-snap-type:x mandatory; padding-bottom:10px;
          cursor: grab;
          -ms-overflow-style: none; /* IE/Edge */
          scrollbar-width: none; /* Firefox */
        }
        .rev-track::-webkit-scrollbar{ display:none; } /* WebKit */
        .rev-track.is-dragging{
          cursor: grabbing;
          user-select: none;
        }
        .rev-card{
          scroll-snap-align:start; background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.12); border-radius:16px; padding:16px; min-height:180px;
        }
        .rev-name{ color:#dbff00; font-weight:700; font-size:.95rem; }
        .rev-date{ color:#9ca3af; font-size:.8rem; }
        .rev-comment{ color:#e5e7eb; margin-top:8px; line-height:1.5; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }
        .stars{ display:inline-flex; gap:2px; }
        .star{ color:#ff36a3; }
      `}</style>

      <div className="rev-header mb-3">
        <h3 className="text-white text-left display-5 text-uppercase mb-0">
          <i className="bi bi-chat-heart"></i> Recensioni
        </h3>
        <div className="rev-actions">
          <Link to="/reviews" className="btn-login d-flex align-items-center">
            Lascia una recensione
          </Link>
        </div>
      </div>

      <div
        className="rev-track"
        ref={trackRef}
        aria-label="Carosello recensioni, trascina per scorrere"
      >
        {items.length === 0 ? (
          <div className="rev-card d-flex align-items-center justify-content-center">
            <span className="text-white-50">Ancora nessuna recensione.</span>
          </div>
        ) : (
          items.map((r) => (
            <article className="rev-card" key={r.id}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="rev-name">{r.display_name || "Utente"}</div>
                  <div className="rev-date">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="stars" aria-label={`${r.rating} su 5 stelle`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i
                      key={i}
                      className={`bi ${
                        i < r.rating
                          ? "bi-star-fill star"
                          : "bi-star text-white-50"
                      }`}
                    ></i>
                  ))}
                </div>
              </div>
              <p className="rev-comment">{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
