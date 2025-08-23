import { useState, useEffect } from "react";
import SessionContext from "./SessionContext";
import supabase from "../supabase/supabase-client";

export default function SessionProvider({ children }) {
    const [session, setSession] = useState(null);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                setSession(null);
            } else if (session) {
                setSession(session);
            }
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <SessionContext.Provider
            value={{
                session,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}