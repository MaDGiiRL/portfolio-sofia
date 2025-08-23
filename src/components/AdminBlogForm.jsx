// /src/components/AdminBlogForm.jsx
import { useState, useContext, useRef, useMemo } from "react";
import supabase from "../supabase/supabase-client";
import SessionContext from "../context/SessionContext";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";

const MAX_TAGS = 12;
const MAX_TAG_LEN = 32;

export default function AdminBlogForm({ onPostCreated }) {
  const { session } = useContext(SessionContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML da Quill
  const [coverUrl, setCoverUrl] = useState(""); // URL esterno
  const [blogTags, setBlogTags] = useState([]); // <--- NUOVO
  const [tagInput, setTagInput] = useState(""); // <--- NUOVO
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const imgRef = useRef(null);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "code-block"],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
  ];

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCoverUrl("");
    setBlogTags([]); // reset tag
    setTagInput("");
    setErrorMsg("");
  };

  const isValidUrl = (value) => {
    if (!value) return true; // opzionale
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  // --- TAG helpers ---
  const normalizeTag = (raw) => {
    if (!raw) return "";
    let t = raw.trim().replace(/^#/, "");
    t = t.replace(/\s+/g, " ");
    return t.slice(0, MAX_TAG_LEN);
  };

  const addTag = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag) return;

    const exists = blogTags.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) return;

    if (blogTags.length >= MAX_TAGS) {
      setErrorMsg(`Puoi inserire al massimo ${MAX_TAGS} tag.`);
      return;
    }
    setBlogTags((p) => [...p, tag]);
    setTagInput("");
  };

  const removeTag = (idx) => {
    setBlogTags((p) => p.filter((_, i) => i !== idx));
  };

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      setBlogTags((p) => p.slice(0, -1));
    }
  };
  // --- /TAG helpers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!session) {
      setErrorMsg("Devi essere autenticata per pubblicare.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Titolo obbligatorio.");
      return;
    }
    const plain = (content || "").replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      setErrorMsg("Il contenuto non può essere vuoto.");
      return;
    }
    if (coverUrl && !isValidUrl(coverUrl)) {
      setErrorMsg("L'URL dell'immagine non è valido (usa http/https).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content, // HTML
        cover_url: coverUrl.trim() || null,
        blog_tags: blogTags, // <--- salva i tag
        profile_id: session.user.id,
        profile_username: session.user.user_metadata?.username || null,
      };

      const { data, error } = await supabase
        .from("blog_posts")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message || String(error));
      resetForm();
      onPostCreated?.(data);
    } catch (err) {
      console.error("Errore pubblicazione:", err);
      setErrorMsg(
        "Non è stato possibile pubblicare l’articolo. " +
          (err?.message || String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card nl-card rounded-4 bg-custom">
      <div className="card-body p-3 p-md-4">
        <form onSubmit={handleSubmit}>
          <h5 className="mb-3 nl-title">Crea un nuovo Post</h5>

          {errorMsg && (
            <div className="alert alert-warning py-2">{errorMsg}</div>
          )}

          <div className="mb-3">
            <label className="nl-label">Titolo</label>
            <input
              type="text"
              className="nl-input"
              placeholder="Titolo del post"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Editor HTML */}
          <div className="mb-3">
            <label className="nl-label">Contenuto (HTML)</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              readOnly={loading}
              placeholder="Scrivi il contenuto…"
            />
            <div className="text-white-50 small mt-1">
              Puoi formattare testo, liste, citazioni, codice e link.
            </div>
          </div>

          {/* TAG del blog */}
          <div className="mb-3">
            <label className="nl-label">Tag del post</label>

            <div className="d-flex flex-wrap gap-2 mb-2">
              {blogTags.map((tag, i) => (
                <span
                  key={`${tag}-${i}`}
                  className="bubbleData normalFont d-inline-flex align-items-center"
                  style={{ gap: 8 }}
                >
                  {tag}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-light py-0 px-2"
                    onClick={() => removeTag(i)}
                    aria-label={`Rimuovi ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              className="nl-input"
              placeholder="Digita un tag e premi Invio o , (es: React, Portfolio, UX)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              disabled={loading}
            />
            <div className="text-white-50 small mt-1">
              Max {MAX_TAGS} tag — niente duplicati. Invio o virgola per
              aggiungere.
            </div>
          </div>

          {/* URL esterno immagine */}
          <div className="mb-3">
            <label className="nl-label">
              URL immagine di copertina (opzionale)
            </label>
            <input
              type="url"
              inputMode="url"
              className="nl-input"
              placeholder="https://..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              disabled={loading}
            />
            {coverUrl && isValidUrl(coverUrl) && (
              <div className="mt-3">
                <img
                  ref={imgRef}
                  src={coverUrl}
                  alt="Anteprima copertina"
                  className="img-fluid rounded"
                  style={{ maxHeight: 240, objectFit: "cover" }}
                  onError={() =>
                    setErrorMsg(
                      "Anteprima: l'immagine non è raggiungibile. Controlla l'URL."
                    )
                  }
                />
              </div>
            )}
            <div className="text-white-50 small mt-1">
              Inserisci un URL pubblico (http/https). 
            </div>
          </div>

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? "Pubblicazione..." : "Pubblica"}
          </button>
        </form>
      </div>
    </div>
  );
}
