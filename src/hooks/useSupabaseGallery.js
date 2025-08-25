import { useEffect, useState } from "react";
import supabase from "../supabase/supabase-client";

/**
 * Legge la tabella "gallery_images".
 * Restituisce: images (array), loading, error.
 */
export default function useSupabaseGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function load() {
            setLoading(true);
            setError("");
            const { data, error } = await supabase
                .from("gallery_images")
                .select("id, title, description, image_url, author, tags, created_at")
                .order("created_at", { ascending: false });

            if (!ignore) {
                if (error) setError(error.message || String(error));
                else setImages(data || []);
                setLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    return { images, loading, error };
}
