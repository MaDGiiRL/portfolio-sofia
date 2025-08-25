import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import supabase from "../../supabase/supabase-client";
import SessionContext from "../../context/SessionContext";
import Avatar from "../../components/others/Avatar";
import ProfileTooltip from "../../components/others/ProfileTooltip";

/**
 * Chat dei commenti per un singolo project post.
 * Prop attesa: { project } con almeno project.id
 */
export default function ProjectChat({ project }) {
  const { t } = useTranslation();
  const { session } = useContext(SessionContext);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /** Fetch con embed disambiguato su profiles!project_comments_user_id_fkey */
  const fetchComments = useCallback(async () => {
    if (!project?.id) return;
    setErrorMsg("");

    const { data: rows, error } = await supabase
      .from("project_comments")
      .select(
        `
        id,
        content,
        created_at,
        updated_at,
        project_post_id,
        profile_id,
        user_id,
        profile_username,
        author:profiles!project_comments_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("project_post_id", project.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Errore caricamento commenti progetto:", error);
      setErrorMsg("Impossibile caricare i commenti del progetto.");
      setMessages([]);
      setInitialLoading(false);
      return;
    }

    const formatted = (rows || []).map((row) => ({
      id: row.id,
      profile_id: row.profile_id, // auth.users id (per ownership)
      user_id: row.user_id, // profiles id (per embed)
      profile_username:
        row.profile_username || row.author?.username || "Unknown",
      avatar_url: row.author?.avatar_url || "default-avatar.png",
      content: row.content,
      created_at: row.created_at,
    }));

    setMessages(formatted);
    setInitialLoading(false);
  }, [project?.id]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;

    const text = message.trim();
    if (!text) return;

    setLoading(true);
    setErrorMsg("");

    const meId = session.user.id; // uguale sia per auth.users.id che profiles.id
    const meUsername = session.user.user_metadata?.username || "You";
    const meAvatar =
      session.user.user_metadata?.avatar_url || "default-avatar.png";

    // Optimistic UI
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      profile_id: meId,
      user_id: meId,
      profile_username: meUsername,
      avatar_url: meAvatar,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    // Insert + select con embed disambiguato
    const { data, error } = await supabase
      .from("project_comments")
      .insert([
        {
          project_post_id: project.id,
          content: text,
          profile_id: meId, // FK → auth.users(id) (ownership)
          user_id: meId, // FK → public.profiles(id) (per embed)
          profile_username: meUsername, // denormalizzazione utile
        },
      ])
      .select(
        `
        id,
        content,
        profile_id,
        user_id,
        profile_username,
        author:profiles!project_comments_user_id_fkey (username, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error("Errore inserimento commento progetto:", error);
      setErrorMsg("Non è stato possibile inviare il commento.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId)); // rollback
    } else {
      const username =
        data.profile_username || data.author?.username || meUsername;
      const avatar = data.author?.avatar_url || meAvatar;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: data.id,
                profile_id: data.profile_id,
                user_id: data.user_id,
                profile_username: username,
                avatar_url: avatar,
                content: data.content,
                created_at: new Date().toISOString(),
              }
            : m
        )
      );
      setMessage("");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    setErrorMsg("");
    const prev = messages;
    setMessages((p) => p.filter((m) => m.id !== id));

    const { error } = await supabase
      .from("project_comments")
      .delete()
      .eq("id", id)
      .eq("profile_id", session?.user.id); // ownership via auth.users

    if (error) {
      console.error("Errore eliminazione commento progetto:", error);
      setErrorMsg("Non puoi cancellare questo commento.");
      setMessages(prev); // rollback
    }
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleEdit = async (id) => {
    const text = editContent.trim();
    if (!text) return;
    setErrorMsg("");

    const prev = messages;
    setMessages((p) =>
      p.map((m) => (m.id === id ? { ...m, content: text } : m))
    );
    setEditingId(null);
    setEditContent("");

    const { error } = await supabase
      .from("project_comments")
      .update({ content: text })
      .eq("id", id)
      .eq("profile_id", session?.user.id); // ownership via auth.users

    if (error) {
      console.error("Errore modifica commento progetto:", error);
      setErrorMsg("Non puoi modificare questo commento.");
      setMessages(prev); // rollback
    }
  };

  // Realtime + primo load
  useEffect(() => {
    if (!project?.id) return;
    setInitialLoading(true);
    fetchComments();

    const channel = supabase
      .channel(`realtime-project-comments-${project.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_comments",
          filter: `project_post_id=eq.${project.id}`,
        },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project?.id, fetchComments]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isOwn = (c) => c.profile_id === session?.user?.id;

  return (
    <motion.div
      className="comment-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4>{t("p7")}</h4>

      {errorMsg && (
        <div className="alert alert-warning py-2 mb-2">{errorMsg}</div>
      )}

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
        {initialLoading ? (
          <p className="text-white-50 text-center">
            {t("loading") || "Caricamento..."}
          </p>
        ) : messages.length === 0 ? (
          <p className="text-white-50 text-center">{t("p8")}</p>
        ) : (
          messages.map((c) => {
            const username = c.profile_username || "Anonimo";
            const canOpen = username !== "Unknown" && username !== "You";

            return (
              <motion.div
                key={c.id}
                className={`comment-card d-flex align-items-start mb-3 ${
                  isOwn(c) ? "user" : "other"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="me-3 flex-shrink-0">
                  <Avatar
                    url={c.avatar_url || "default-avatar.png"}
                    alt={`${username} Avatar`}
                    className="rounded-circle avatar-responsive"
                    size={80}
                  />
                </div>

                <div className="comment-content">
                  {canOpen ? (
                    <ProfileTooltip
                      username={username}
                      profileId={c.user_id || c.profile_id}
                    />
                  ) : (
                    <strong className="d-block btn-login">@{username}</strong>
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
                        {t("pchat1")}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                        className="btn-sm btn-login"
                      >
                        {t("pchat2")}
                      </button>
                    </>
                  ) : (
                    <p className="mb-0">{c.content}</p>
                  )}

                  {isOwn(c) && editingId !== c.id && (
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
    </motion.div>
  );
}
