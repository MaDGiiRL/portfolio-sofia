import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase/supabase-client";
import { Link } from "react-router";
import { useTranslation } from 'react-i18next';

export default function RealtimeChat() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const messagesEndRef = useRef(null);
    const { t } = useTranslation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const getMessages = async () => {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            console.error("Errore nel recupero messaggi:", error.message);
            return;
        }

        setMessages(data ?? []);
        scrollToBottom();
    };

    // Controllo utente loggato e setup realtime
    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user ?? null);
        };

        fetchUser();
        getMessages();

        const channel = supabase
            .channel("messages")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                    scrollToBottom();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        const profile_username = user.email?.split("@")[0] ?? "Anonimo";

        const { error } = await supabase.from("messages").insert([
            {
                content: newMessage,
                profile_username,
            },
        ]);

        if (error) {
            console.error("Errore invio messaggio:", error.message);
        } else {
            setNewMessage("");
        }
    };

    return (
        <div className="chat-wrapper">
            {open && (
                <div className="chat-container">
                    <div className="chat-header">
                        Live Chat - {t('form37')} <i className="bi bi-chat-heart"></i>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className="chat-message">
                                <p className="chat-bubble">
                                    <strong>{msg.profile_username}:</strong> {msg.content}
                                </p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {user ? (
                        <form className="chat-input" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Scrivi un messaggio..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit">➤</button>
                        </form>
                    ) : (
                        <div className="chat-not-logged d-flex flex-column align-items-center justify-content-center p-3 m-3 rounded shadow-sm text-center">
                            <p className="mb-2 fw-semibold text-white">
                                {t('form38')}
                            </p>
                            <div className="d-flex gap-2">
                                <Link
                                    to="/login"
                                    className="btn-login btn-sm fw-bold"
                                >
                                    {t('form14')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-login btn-sm fw-bold"
                                >
                                    {t('form11')}
                                </Link>
                            </div>
                        </div>

                    )}
                </div>
            )}

            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                {open ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots"></i>}
            </button>
        </div>
    );
}
