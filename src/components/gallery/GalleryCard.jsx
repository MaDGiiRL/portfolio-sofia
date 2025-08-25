import React from "react";

function Badge({ children }) {
  return (
    <span
      className="ad-badge"
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

export default function GalleryCard({ item, onOpen }) {
  return (
    <article
      className="g-card"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen(item.id);
      }}
      aria-label={`${item.title}: apri anteprima`}
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: "16px",
        overflow: "hidden",
        transition:
          "transform .2s ease, box-shadow .25s ease, border-color .25s ease",
        boxShadow: "0 0 0 1px rgba(255,255,255,.02)",
        cursor: "default",
      }}
    >
      <div
        className="g-thumb"
        onClick={() => onOpen(item.id)}
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
      <div className="g-body" style={{ padding: 12 }}>
        <div className="g-title" style={{ fontWeight: 800, color: "#fff" }}>
          {item.title}
        </div>
        <p
          className="g-desc"
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
        <div
          className="g-meta"
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
          <div
            className="g-tags"
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            {(item.tags || []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="g-tag"
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
      </div>
    </article>
  );
}
