import { useState, useContext, useMemo } from "react";
import supabase from "../../supabase/supabase-client";
import SessionContext from "../../context/SessionContext";
import { useTranslation } from "react-i18next";
const MAX_TAGS = 12;
const MAX_TAG_LEN = 32;

export default function AdminGalleryForm({ onCreated }) {
  const { session } = useContext(SessionContext);
  const { i18n, t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isValidUrl = (value) => {
    if (!value) return false;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

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
    const exists = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (exists) return;
    if (tags.length >= MAX_TAGS) {
      setErrorMsg(`Puoi inserire al massimo ${MAX_TAGS} tag.`);
      return;
    }
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (idx) =>
    setTags((prev) => prev.filter((_, i) => i !== idx));

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setAuthor("");
    setTags([]);
    setTagInput("");
    setErrorMsg("");
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
    if (!description.trim()) {
      setErrorMsg("La descrizione non può essere vuota.");
      return;
    }
    if (!isValidUrl(imageUrl)) {
      setErrorMsg("L'URL dell'immagine non è valido (usa http/https).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl.trim(),
        author: author.trim() || null,
        tags,
        profile_id: session.user.id,
        profile_username: session.user.user_metadata?.username || null,
      };

      const { data, error } = await supabase
        .from("gallery_images")
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(error.message || String(error));
      resetForm();
      onCreated?.(data);
    } catch (err) {
      console.error("Errore creazione immagine:", err);
      setErrorMsg(
        "Non è stato possibile salvare l’immagine. " +
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
          <h5 className="mb-3 nl-title">Aggiungi immagine alla Gallery</h5>

          {errorMsg && (
            <div className="alert alert-warning py-2">{errorMsg}</div>
          )}

          <div className="mb-3">
            <label className="nl-label">Titolo</label>
            <input
              type="text"
              className="nl-input"
              placeholder="Titolo immagine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="mb-3">
            <label className="nl-label">Descrizione</label>
            <textarea
              className="nl-input"
              rows={4}
              placeholder="Breve descrizione (max 500)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              disabled={loading}
              required
            />
            <div className="text-white-50 small mt-1">
              Testo semplice (niente HTML). Max 500 caratteri.
            </div>
          </div>

          <div className="mb-3">
            <label className="nl-label">URL immagine</label>
            <input
              type="url"
              inputMode="url"
              className="nl-input"
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
              required
            />
            {isValidUrl(imageUrl) && (
              <div className="mt-3">
                <img
                  src={imageUrl}
                  alt="Anteprima"
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
          </div>

          <div className="mb-3">
            <label className="nl-label">Autore (opzionale)</label>
            <input
              type="text"
              className="nl-input"
              placeholder="Nome autore/credit"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <label className="nl-label">Tag (max {MAX_TAGS})</label>
            <div className="d-flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => (
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
              placeholder="Digita un tag e premi Invio o ,"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={onTagKeyDown}
              disabled={loading}
            />
            <div className="text-white-50 small mt-1">
              Invio o virgola per aggiungere. Niente duplicati.
            </div>
          </div>

          <button type="submit" className="btn btn-accent" disabled={loading}>
            {loading ? "Salvataggio…" : "Salva"}
          </button>
        </form>
      </div>
    </div>
  );
}
