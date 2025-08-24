
import { useState, useContext, useMemo } from "react";
import supabase from "../../supabase/supabase-client";
import SessionContext from "../../context/SessionContext";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";

const MAX_TAGS = 12;
const MAX_TAG_LEN = 32;

export default function AdminProjectForm({ onProjectCreated }) {
  const { session } = useContext(SessionContext);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // HTML Quill
  const [coverUrl, setCoverUrl] = useState(""); // URL esterno
  const [stackTags, setStackTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  // NEW: link esterni
  const [githubUrl, setGithubUrl] = useState(""); // <--- NEW
  const [previewUrl, setPreviewUrl] = useState(""); // <--- NEW

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setStackTags([]);
    setTagInput("");
    setGithubUrl(""); // <--- NEW
    setPreviewUrl(""); // <--- NEW
    setErrorMsg("");
  };

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  // --- Gestione TAG ---
  const normalizeTag = (raw) => {
    if (!raw) return "";
    let t = raw.trim().replace(/^#/, "");
    t = t.replace(/\s+/g, " ");
    t = t.slice(0, MAX_TAG_LEN);
    return t;
  };

  const addTag = (raw) => {
    const tag = normalizeTag(raw);
    if (!tag) return;

    const exists = stackTags.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) return;

    if (stackTags.length >= MAX_TAGS) {
      setErrorMsg(`Puoi inserire al massimo ${MAX_TAGS} tag.`);
      return;
    }

    setStackTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (idx) => {
    setStackTags((prev) => prev.filter((_, i) => i !== idx));
  };

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      setStackTags((prev) => prev.slice(0, -1));
    }
  };

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
    // NEW: validazioni link
    if (githubUrl && !isValidUrl(githubUrl)) {
      setErrorMsg("L'URL GitHub non è valido (usa http/https).");
      return;
    }
    if (previewUrl && !isValidUrl(previewUrl)) {
      setErrorMsg("L'URL Preview non è valido (usa http/https).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content, // HTML
        cover_url: coverUrl.trim() || null,
        stack_tags: stackTags,
        profile_id: session.user.id,
        profile_username: session.user.user_metadata?.username || null,
        // NEW: salvataggio link
        github_url: githubUrl.trim() || null,
        preview_url: previewUrl.trim() || null,
      };

      const { data, error } = await supabase
        .from("project_posts")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message || String(error));
      resetForm();
      onProjectCreated?.(data);
    } catch (err) {
      console.error("Errore pubblicazione progetto:", err);
      setErrorMsg(
        "Non è stato possibile pubblicare il progetto. " +
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
          <h5 className="mb-3 nl-title">Crea un nuovo Progetto</h5>

          {errorMsg && (
            <div className="alert alert-warning py-2">{errorMsg}</div>
          )}

          <div className="mb-3">
            <label className="nl-label">Titolo</label>
            <input
              type="text"
              className="nl-input"
              placeholder="Titolo del progetto"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="nl-label">Descrizione / Contenuto (HTML)</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              readOnly={loading}
              placeholder="Descrivi il progetto…"
            />
            <div className="text-white-50 small mt-1">
              Puoi formattare testo, liste, citazioni, codice e link.
            </div>
          </div>

          {/* --- STACK / TAG --- */}
          <div className="mb-3">
            <label className="nl-label">Stack / Tecnologie (tag)</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {stackTags.map((tag, i) => (
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
              placeholder="Digita un tag e premi Invio o , (es: React, Supabase, Bootstrap)"
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
          {/* --- fine STACK / TAG --- */}

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
                  src={coverUrl}
                  alt="Anteprima copertina"
                  className="img-fluid rounded"
                  style={{ maxHeight: 240, objectFit: "cover" }}
                  onError={() =>
                    setErrorMsg(
                      "Anteprima: immagine non raggiungibile. Controlla l'URL."
                    )
                  }
                />
              </div>
            )}
            <div className="text-white-50 small mt-1">
              Inserisci un URL pubblico (http/https)
            </div>
          </div>

          {/* --- NEW: LINK ESTERNI --- */}
          <div className="mb-3">
            <label className="nl-label">Link GitHub (opzionale)</label>
            <input
              type="url"
              inputMode="url"
              className="nl-input"
              placeholder="https://github.com/utente/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={loading}
            />
            <div className="text-white-50 small mt-1">
              Inserisci l’URL della repo (http/https).
            </div>
          </div>

          <div className="mb-4">
            <label className="nl-label">Link Preview / Live (opzionale)</label>
            <input
              type="url"
              inputMode="url"
              className="nl-input"
              placeholder="https://tuo-dominio.com"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              disabled={loading}
            />
            <div className="text-white-50 small mt-1">
              Inserisci l’URL della demo live (http/https).
            </div>
          </div>
          {/* --- FINE LINK ESTERNI --- */}

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? "Pubblicazione..." : "Pubblica"}
          </button>
        </form>
      </div>
    </div>
  );
}
