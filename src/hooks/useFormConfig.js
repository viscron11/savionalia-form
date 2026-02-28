import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Real-time listener for the form configuration document.
 * Reads from config/form in Firestore.
 * Returns the form title, subtitle, and dynamic field definitions.
 */
export function useFormConfig() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            doc(db, "config", "form"),
            (snapshot) => {
                if (snapshot.exists()) {
                    setConfig(snapshot.data());
                } else {
                    setError("Nie znaleziono konfiguracji formularza.");
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error listening to form config:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { config, loading, error };
}
