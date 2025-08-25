import React from "react";

export default function GalleryFilters({ query, onQuery, tag, onTag, tags }) {
  return (
    <>
      <input
        className="g-input"
        type="search"
        placeholder="Cerca per titolo, autore o tag…"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        aria-label="Cerca nella gallery"
        style={{
          appearance: "none",
          outline: "none",
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 12,
          color: "var(--text)",
          padding: ".55rem .8rem",
          minWidth: "clamp(180px, 30vw, 280px)",
        }}
      />

      <select
        className="g-select"
        value={tag}
        onChange={(e) => onTag(e.target.value)}
        aria-label="Filtra per tag"
        style={{
          appearance: "none",
          outline: "none",
          background: "rgba(20,20,25,.95)", // sfondo dark
          border: "1px solid rgba(255,255,255,.15)",
          borderRadius: 12,
          color: "#e5e7eb", // testo chiaro
          padding: ".55rem .8rem",
          cursor: "pointer",
        }}
      >
        {tags.map((t) => (
          <option
            key={t}
            value={t}
            style={{
              backgroundColor: "#0b0b0e", // opzioni dark
              color: "#e5e7eb",
            }}
          >
            {t === "all" ? "Tutti i tag" : `#${t}`}
          </option>
        ))}
      </select>
    </>
  );
}
