// /src/pages/ReviewsPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router";
import supabase from "../supabase/supabase-client";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const PAGE_SIZE = 6;

export default function ReviewsPage({ subjectType = "site" }) {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  // Lista
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auth
  useEffect(() => {
    let sub;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
      sub = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    })();
    return () => {
      sub?.data?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch approvate
  const fetchReviews = useCallback(
    async (currentPage = 1) => {
      setLoading(true);
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [countRes, dataRes] = await Promise.all([
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("approved", true)
          .eq("subject_type", subjectType),
        supabase
          .from("reviews")
          .select("id, display_name, rating, comment, created_at", {
            count: "exact",
          })
          .eq("approved", true)
          .eq("subject_type", subjectType)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      setTotal(countRes.error ? 0 : countRes.count ?? 0);
      setItems(dataRes.error ? [] : dataRes.data || []);
      setLoading(false);
    },
    [subjectType]
  );

  useEffect(() => {
    fetchReviews(page);
  }, [page, fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [subjectType]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / PAGE_SIZE)),
    [total]
  );

  const goTo = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    setPage(p);
  };
  const pageNumbers = useMemo(() => {
    const max = Math.min(totalPages, 5);
    const start = Math.max(1, Math.min(page - 2, totalPages - max + 1));
    return Array.from({ length: max }, (_, i) => start + i);
  }, [page, totalPages]);

  // Submit -> va in moderazione
  const submitReview = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user) {
      setErrorMsg("Devi essere loggato per recensire.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setErrorMsg("Seleziona un numero di stelle da 1 a 5.");
      return;
    }
    if (!comment || comment.trim().length < 3) {
      setErrorMsg("Il commento deve avere almeno 3 caratteri.");
      return;
    }

    setSubmitting(true);

    const display_name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Utente";

    // ⚠️ Forziamo approved: null per la coda di moderazione
    const payload = {
      user_id: user.id,
      display_name,
      rating,
      comment: comment.trim(),
      subject_type: subjectType, // la tua tabella non ha subject_id
      approved: null,
    };

    const { error } = await supabase.from("reviews").insert(payload);

    if (error) {
      console.error(error);
      setErrorMsg("Errore durante l'invio della recensione.");
    } else {
      Swal.fire({
        icon: "success",
        title: "Grazie!",
        text: "La tua recensione è in fase di moderazione e verrà pubblicata dopo l'approvazione.",
        background: "#1e1e1e",
        color: "#fff",
        iconColor: "#dbff00",
        confirmButtonColor: "#dbff00",
      });
      // reset form
      setRating(0);
      setHover(0);
      setComment("");
      // non aggiorno la lista: mostra solo approved=true
    }

    setSubmitting(false);
  };

  return (
    <div className="container py-5 mt-5">
      <style>{`
  .rev-form{padding:16px;}
  .stars{ display:inline-flex; gap:4px; font-size:1.3rem; cursor:pointer; }
  .star{ color:#ff36a3; }
  .review-card{
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.12);
    padding:16px;
    height:100%;
  }
  .rev-textarea{
    font-size: 18px;
    display: inline-block;
    padding: 15px;
    width: 100%;
    border-radius: 5px;
    border: 1px solid rgb(19, 19, 19);
    color: #c9c9c9;
    background-color: #000;
    cursor: pointer;
    outline: none; box-shadow: none; resize: vertical; caret-color: #c9c9c9;
  }
  .rev-textarea::placeholder{ color:#7a7a7a; }
  .rev-textarea:focus,.rev-textarea:active{
    border: 1px solid rgb(19, 19, 19); background:#000; color:#c9c9c9; outline:none; box-shadow:none;
  }
`}</style>

      {/* Header */}
      <div className="row header pt-5 align-items-center">
        <div className="col">
          <h2 className="text-white display-6 text-uppercase mb-0">
            <i className="bi bi-chat-heart"></i> Recensioni
          </h2>
        </div>
        <div className="col-auto">
          <Link to="/" className="btn-login">
            ← {t("form27")}
          </Link>
        </div>
      </div>

      {/* CTA login / Form */}
      {!user ? (
        <div className="alert alert-secondary mt-3">
          <strong>Logga per recensire.</strong>{" "}
          <Link to="/login" className="text-nav">
            Vai al login
          </Link>
        </div>
      ) : (
        <form className="rev-form bg-custom mt-3" onSubmit={submitReview}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 text-white">Lascia una recensione</h5>
            <div className="stars" aria-label="Scegli il numero di stelle">
              {Array.from({ length: 5 }).map((_, i) => {
                const idx = i + 1;
                const filled = (hover || rating) >= idx;
                return (
                  <i
                    key={idx}
                    className={`bi ${
                      filled ? "bi-star-fill star" : "bi-star text-white-50"
                    }`}
                    onMouseEnter={() => setHover(idx)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(idx)}
                    role="button"
                    aria-label={`${idx} stelle`}
                  />
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <textarea
              className="rev-textarea"
              placeholder="Scrivi il tuo commento…"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              required
            />
            <div className="text-white-50 small mt-1">
              Min 3 caratteri • Max 1000
            </div>
          </div>

          {errorMsg && <div className="text-danger mt-2">{errorMsg}</div>}

          <div className="mt-3 text-end">
            <button className="bubbleData" type="submit" disabled={submitting}>
              {submitting ? "Invio…" : "Invia recensione"}
            </button>
          </div>
        </form>
      )}

      {/* Lista recensioni */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center text-white-50 py-5">{t("account4")}</div>
        ) : total === 0 ? (
          <div className="alert alert-secondary">Nessuna recensione.</div>
        ) : (
          <>
            <div className="row g-3">
              {items.map((r) => (
                <div className="col-12 col-md-6 col-lg-4" key={r.id}>
                  <article className="review-card">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="text-white fw-bold">
                        {r.display_name || "Utente"}
                      </div>
                      <small className="text-white-50">
                        {new Date(r.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <div className="mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={`bi ${
                            i < r.rating
                              ? "bi-star-fill star"
                              : "bi-star text-white-50"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className="text-white-50 mt-2 mb-0"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {r.comment}
                    </p>
                  </article>
                </div>
              ))}
            </div>

            {/* Paginazione coerente */}
            <div className="mt-4 d-flex align-items-center">
              <div
                className="ad-pager__info"
                style={{ marginRight: "auto", color: "#a3a3a3", fontSize: 12 }}
              >
                {total > 0
                  ? `Pagina ${page} / ${totalPages} • ${total} recensioni`
                  : "Nessuna recensione"}
              </div>
              <nav className="ad-pager" aria-label="Paginazione recensioni">
                <button
                  className="ad-btn ad-btn--ghost"
                  onClick={() => goTo(page - 1)}
                  disabled={page <= 1}
                >
                  ← Prev
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    className="ad-btn ad-btn--ghost"
                    onClick={() => goTo(p)}
                    disabled={p === page}
                    style={
                      p === page
                        ? { opacity: 0.8, cursor: "default" }
                        : undefined
                    }
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="ad-btn"
                  onClick={() => goTo(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next →
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
