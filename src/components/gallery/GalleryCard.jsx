import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient"; 

export default function GalleryCard({ item, onOpen, enableRealtime = false }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes_count ?? 0);
  const [loading, setLoading] = useState(true);

  // stesso device_id usato dal client (header x-client-id)
  const deviceId = useMemo(() => {
    try {
      return localStorage.getItem("device_id") || "";
    } catch {
      return "";
    }
  }, []);

  // Init: verifica se questo device ha già messo like su questa immagine
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (!deviceId) {
          console.warn("[likes] deviceId mancante: controlla localStorage/SSR");
          return;
        }
        const { data, error } = await supabase
          .from("likes")
          .select("id")
          .eq("image_id", item.id)
          .eq("device_id", deviceId)
          .maybeSingle();

        if (error) console.error("[likes] SELECT error:", error);
        if (!error && active) setLiked(!!data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [item.id, deviceId]);

  // Realtime opzionale: sincronizza il contatore tra tab/dispositivi
  useEffect(() => {
    if (!enableRealtime) return;
    const channel = supabase
      .channel(`likes:${item.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "likes", filter: `image_id=eq.${item.id}` },
        () => setLikesCount((c) => c + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "likes", filter: `image_id=eq.${item.id}` },
        () => setLikesCount((c) => Math.max(c - 1, 0))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.id, enableRealtime]);

  // Refetch del contatore dal DB per allinearsi ai trigger
  const refreshCount = async () => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("likes_count")
      .eq("id", item.id)
      .single();

    if (error) {
      console.error("[likes] REFRESH error:", error);
      return;
    }
    setLikesCount(data?.likes_count ?? 0);
  };

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    // UI ottimistica
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);

    try {
      if (!prevLiked) {
        // INSERT
        const { error } = await supabase
          .from("likes")
          .insert({ image_id: item.id, device_id: deviceId });

        // Ignora unique_violation in caso di doppio click/corsa
        if (error && error.code !== "23505") throw error;
      } else {
        // DELETE
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("image_id", item.id)
          .eq("device_id", deviceId);

        if (error) throw error;
      }

      // Allinea col valore "vero" scritto dai trigger
      await refreshCount();
    } catch (err) {
      // rollback
      setLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("[likes] toggle error:", err);
    }
  };

  return (
    <article
      className="g-card"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen?.(item.id);
      }}
      aria-label={`${item.title}: apri anteprima`}
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 16,
        overflow: "hidden",
        transition: "transform .2s ease, box-shadow .25s ease, border-color .25s ease",
        boxShadow: "0 0 0 1px rgba(255,255,255,.02)",
        cursor: "default",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {/* Thumbnail */}
      <div
        className="g-thumb"
        onClick={() => onOpen?.(item.id)}
        style={{
          aspectRatio: "16/10",
          background: "linear-gradient(135deg,#1f2937,#111827)",
          overflow: "hidden",
          position: "relative",
          cursor: "zoom-in",
        }}
      >
        <img
          src={item.image_url}
          alt={item.title}
          loading="lazy"
          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform .45s ease",
          }}
        />
      </div>

      {/* Body */}
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 800, color: "#fff" }}>{item.title}</div>

        <p
          style={{
            margin: ".35rem 0 .25rem",
            color: "#cfd2db",
            fontSize: ".95rem",
            lineHeight: 1.45,
            minHeight: "2.6em",
          }}
        >
          {item.description}
        </p>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            flexWrap: "wrap",
            marginTop: ".25rem",
          }}
        >
          <Badge>{item.author || "—"}</Badge>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(item.tags || []).slice(0, 3).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: ".78rem",
                  color: "#cfd2db",
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid rgba(255,255,255,.12)",
                  padding: ".2rem .5rem",
                  borderRadius: 999,
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Like button */}
        <button
          onClick={toggleLike}
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: ".9rem",
            color: liked ? "rgb(239 68 68)" : "#cfd2db",
            fontWeight: 600,
          }}
          aria-pressed={liked}
          title={liked ? "Rimuovi mi piace" : "Metti mi piace"}
        >
          {liked ? "❤️" : "🤍"} {likesCount}
        </button>
      </div>
    </article>
  );
}

/* --- Componenti interni --- */
function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: ".35rem",
        padding: ".25rem .55rem",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,.2)",
        background: "rgba(255,255,255,.06)",
        fontSize: ".78rem",
        color: "#e5e7eb",
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
