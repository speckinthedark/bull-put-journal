import { useState, useEffect } from 'react';
import { auth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, db, doc, getDoc, setDoc } from '../firebase';

/**
 * Custom hook for Firebase authentication and user data
 * @returns {Object} - Authentication state, user ID, and user data
 */
export const useAuth = () => {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                setUserId(authUser.uid);
                
                // Fetch or create user profile
                try {
                    const userDocRef = doc(db, 'users', authUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    
                    if (userDoc.exists()) {
                        setUser({ uid: authUser.uid, ...userDoc.data() });
                    } else {
                        // Create initial user profile
                        const initialUserData = {
                            accountBalance: 10000,
                            accountHistory: [],
                            createdAt: new Date().toISOString()
                        };
                        await setDoc(userDocRef, initialUserData);
                        setUser({ uid: authUser.uid, ...initialUserData });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // Set basic user data if fetch fails
                    setUser({ 
                        uid: authUser.uid, 
                        accountBalance: 10000, 
                        accountHistory: [] 
                    });
                }
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

    return { userId, user, isAuthReady };
};
