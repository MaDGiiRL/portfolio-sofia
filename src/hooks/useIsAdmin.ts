import { useEffect, useState } from "react";
import supabase from "../supabase/supabase-client";


export function useIsAdmin() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
        let mounted = true;
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setIsAdmin(false); setLoading(false); return; }
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .maybeSingle();
            if (mounted) {
                setIsAdmin(profile?.role === "admin");
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);


    return { isAdmin, loading };
}