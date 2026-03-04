import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";

/**
 * Hook that manages Google authentication and admin authorization.
 * Checks if the signed-in user's email is in the config/admins allowedEmails list.
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                // Check if user is an allowed admin
                try {
                    const adminsDoc = await getDoc(doc(db, "config", "admins"));
                    if (adminsDoc.exists()) {
                        const allowedEmails = adminsDoc.data().allowedEmails || [];
                        setIsAdmin(allowedEmails.includes(firebaseUser.email));
                    } else {
                        setIsAdmin(false);
                    }
                } catch (err) {
                    console.error("Error checking admin status:", err);
                    setIsAdmin(false);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async () => {
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            setError(err.message);
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return { user, isAdmin, loading, error, login, logout };
}
