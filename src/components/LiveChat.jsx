import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabase/supabase-client";

export default function LiveChat({ currentUser }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false);
    const messagesEndRef = useRef(null);

    // Carica i messaggi con username già joinato
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("id, content, profile_id, profile_username, updated_at")
                .order("updated_at", { ascending: true });

            if (error) console.error(error);
            else setMessages(data);
        };

        fetchMessages();

        const subscription = supabase
            .channel("public:messages")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages" },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(subscription);
    }, []);

    // Scroll automatico
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Recupera lo username direttamente dal profilo prima di inviare
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", currentUser.id)
            .single();

        const username = profileError ? "Anonimo" : profileData.username;

        const newMessage = {
            content: input,
            profile_id: currentUser.id,
            profile_username: username,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("messages").insert([newMessage]);
        if (error) console.error(error);
        else setInput("");
    };

    return (
        <div className="chat-wrapper">
            {open && (
                <div className="chat-container">
                    <div className="chat-header">
                        Live Chat - Lascia un Saluto! <i className="bi bi-chat-heart"></i>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className="chat-message">
                                <p className="chat-bubble">
                                    <strong>{msg.profile_username || "Anonimo"}:</strong> {msg.content}
                                </p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Scrivi un messaggio..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit">Invia</button>
                    </form>
                </div>
            )}

            <button className="chat-toggle" onClick={() => setOpen(!open)}>
                {open ? <i className="bi bi-x-lg"></i> : <i className="bi bi-chat-dots"></i>}
            </button>
        </div>
    );
}
