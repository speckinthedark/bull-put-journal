import { useState, useEffect } from 'react';
import { auth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from '../firebase';

/**
 * Custom hook for Firebase authentication
 * @returns {Object} - Authentication state and user ID
 */
export const useAuth = () => {
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribeAuth();
    }, []);

    return { userId, isAuthReady };
};
