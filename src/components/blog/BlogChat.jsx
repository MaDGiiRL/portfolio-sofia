import { useEffect, useState, useContext, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import supabase from "../../supabase/supabase-client";
import SessionContext from "../../context/SessionContext";
import Avatar from "../../components/others/Avatar";
import ProfileTooltip from "../others/ProfileTooltip";

const ACCENT_PINK = "#ff36a3";
const ACCENT_LIME = "rgb(165, 233, 39)";
const DARK_BG = "#0f0f10";
const DARK_TEXT = "#eaeaea";

export default function BlogChat({ post }) {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Carica commenti dal DB (tabella comments)
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id, content, created_at, updated_at, profile_id, profile_username,
        author:profiles!comments_profile_id_fkey (id, username, avatar_url)
      `
      )
      .eq("blog_post_id", post.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Errore caricamento commenti:", error);
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: t("form5"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }

    const formatted = (data || []).map((row) => ({
      id: row.id,
      profile_id: row.profile_id,
      profile_username:
        row.profile_username || row.author?.username || "Unknown",
      avatar_url: row.author?.avatar_url,
      content: row.content,
    }));

    setMessages(formatted);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      Swal.fire({
        icon: "info",
        title: t("pchat4") || t("b2"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      return;
    }
    const text = message.trim();
    if (!text) return;

    setLoading(true);

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      profile_id: session.user.id,
      profile_username: session.user.user_metadata?.username || "You",
      avatar_url:
        session.user.user_metadata?.avatar_url || "default-avatar.png",
      content: text,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error } = await supabase
      .from("comments")
      .insert([{ blog_post_id: post.id, content: text }])
      .select()
      .single();

    if (error) {
      console.error("Errore inserimento commento:", error);
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: t("b3"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } else {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: data.id,
                profile_id: data.profile_id,
                profile_username:
                  data.profile_username ||
                  session.user.user_metadata?.username ||
                  "Unknown",
                avatar_url:
                  session.user.user_metadata?.avatar_url ||
                  "default-avatar.png",
                content: data.content,
              }
            : m
        )
      );
      setMessage("");
      // feedback visivo
      Swal.fire({
        icon: "success",
        title: t("b4"),
        text:  t("b5"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_LIME,
        confirmButtonColor: ACCENT_LIME,
        timer: 1200,
        showConfirmButton: false,
      });
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    // Conferma eliminazione
    const confirm = await Swal.fire({
      icon: "warning",
      title: t("b6"),
      text: t("b7"),
      showCancelButton: true,
      confirmButtonText: t("b8"),
      cancelButtonText: t("pchat2"),
      background: DARK_BG,
      color: DARK_TEXT,
      iconColor: ACCENT_PINK,
      confirmButtonColor: ACCENT_PINK,
      cancelButtonColor: "#2a2a2a",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    const prev = messages;
    setMessages((p) => p.filter((m) => m.id !== id));

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", id)
      .eq("profile_id", session?.user.id);

    if (error) {
      console.error("Errore eliminazione commento:", error);
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: t("b9"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      setMessages(prev); // rollback
    } else {
      Swal.fire({
        icon: "success",
        title: t("b10"),
        text: t("b11"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_LIME,
        confirmButtonColor: ACCENT_LIME,
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleEdit = async (id) => {
    const text = editContent.trim();
    if (!text) return;

    const prev = messages;
    setMessages((p) =>
      p.map((m) => (m.id === id ? { ...m, content: text } : m))
    );
    setEditingId(null);
    setEditContent("");

    const { error } = await supabase
      .from("comments")
      .update({ content: text })
      .eq("id", id)
      .eq("profile_id", session?.user.id);

    if (error) {
      console.error("Errore modifica commento:", error);
      Swal.fire({
        icon: "error",
        title: t("form5"),
        text: t("b12"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_PINK,
        confirmButtonColor: ACCENT_PINK,
      });
      setMessages(prev); // rollback
    } else {
      Swal.fire({
        icon: "success",
        title: t("b13"),
        text: t("b14"),
        background: DARK_BG,
        color: DARK_TEXT,
        iconColor: ACCENT_LIME,
        confirmButtonColor: ACCENT_LIME,
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  // Realtime su comments
  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `blog_post_id=eq.${post.id}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <motion.div
      className="comment-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4>{t("p7")}</h4>

      <motion.div
        className="comment-messages"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        {messages.length === 0 ? (
          <p className="text-white-50 text-center">{t("p8")}</p>
        ) : (
          messages.map((c) => {
            const canOpen =
              c.profile_username &&
              c.profile_username !== "Unknown" &&
              c.profile_username !== "You";
            return (
              <motion.div
                key={c.id}
                className={`comment-card d-flex align-items-start mb-3 ${
                  c.profile_id === session?.user.id ? "user" : "other"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Avatar */}
                <div className="me-3 flex-shrink-0">
                  <Avatar
                    url={c.avatar_url || "default-avatar.png"}
                    alt={`${c.profile_username} Avatar`}
                    className="rounded-circle avatar-responsive"
                    size={80}
                  />
                </div>

                {/* Contenuto */}
                <div className="comment-content">
                  {canOpen ? (
                    <ProfileTooltip
                      username={c.profile_username}
                      profileId={c.profile_id}
                    />
                  ) : (
                    <strong className="d-block">
                      @{c.profile_username || "Anonimo"}
                    </strong>
                  )}

                  {editingId === c.id ? (
                    <>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="form-control mb-2"
                      />
                      <button
                        onClick={() => handleEdit(c.id)}
                        className="btn-sm btn-login me-2"
                      >
                        {t("b15")}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                        className="btn-sm btn-login"
                      >
                        {t("b16")}
                      </button>
                    </>
                  ) : (
                    <p className="mb-0">{c.content}</p>
                  )}

                  {c.profile_id === session?.user.id && editingId !== c.id && (
                    <div className="mt-1">
                      <button
                        onClick={() => startEditing(c)}
                        className="btn-sm btn-login me-2"
                        title="Modifica"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="btn-sm btn-login"
                        title="Elimina"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Form invio */}
      <motion.form
        onSubmit={handleMessageSubmit}
        className="comment-form mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {!session && <p className="text-warning small mb-2">{t("pchat3")}</p>}
        <div className="d-flex gap-2 w-100">
          <textarea
            placeholder={t("p10")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="form-control input-dark flex-grow-1"
            style={{ resize: "none" }}
            disabled={!session}
          />
          <button
            type="submit"
            className="btn btn-accent d-flex align-items-center justify-content-center px-3"
            disabled={loading || !session}
            title={!session ? t("pchat4") : undefined}
          >
            <i className="bi bi-send fs-3 pt-1"></i>
          </button>
        </div>
      </motion.form>

      <style>{`
        .btn.btn-accent { 
          background: ${ACCENT_PINK};
          border-color: ${ACCENT_PINK};
          color: #0b0b0b;
          font-weight: 600;
        }
        .btn.btn-accent:hover { filter: brightness(1.07); }
        .btn.btn-accent:focus { box-shadow: 0 0 0 .25rem rgba(255, 54, 163, .2); }
        .input-dark { background:#1a1a1a; border-color:#2b2b2b; color:#eaeaea; }
        .input-dark:focus { background:#1a1a1a; border-color:${ACCENT_LIME}; box-shadow: 0 0 0 .25rem rgba(165,233,39,.15); }
      `}</style>
    </motion.div>
  );
}
