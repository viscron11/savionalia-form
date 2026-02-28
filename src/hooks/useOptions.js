import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Real-time listener for the "options" collection in Firestore.
 * Returns an array of option objects with their id, name, totalSpots, and spotsLeft.
 * Updates live whenever the Firestore data changes.
 */
export function useOptions() {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "options"), orderBy("name"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOptions(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error listening to options:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { options, loading, error };
}
