import { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, query, deleteDoc } from 'firebase/firestore';

/**
 * Custom hook for managing trades data
 * @param {string} userId - Current user ID
 * @param {boolean} isAuthReady - Whether authentication is ready
 * @returns {Object} - Trades data and CRUD operations
 */
export const useTrades = (userId, isAuthReady) => {
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthReady || !userId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const tradesCollectionPath = `/artifacts/${appId}/users/${userId}/trades`;
        const q = query(collection(db, tradesCollectionPath));

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            const tradesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTrades(tradesData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching trades:", error);
            setIsLoading(false);
        });

        return () => unsubscribeFirestore();
    }, [isAuthReady, userId]);

    const addTrade = async (tradeData) => {
        if (!userId) {
            console.error("User not authenticated");
            return;
        }
        const tradesCollectionPath = `/artifacts/${appId}/users/${userId}/trades`;
        try {
            await addDoc(collection(db, tradesCollectionPath), { ...tradeData, userId });
        } catch (error) {
            console.error("Error adding trade:", error);
            throw error;
        }
    };

    const updateTrade = async (tradeId, updateData) => {
        if (!userId) {
            console.error("User not authenticated");
            return;
        }
        const tradeDocPath = `/artifacts/${appId}/users/${userId}/trades/${tradeId}`;
        try {
            await updateDoc(doc(db, tradeDocPath), updateData);
        } catch (error) {
            console.error("Error updating trade:", error);
            throw error;
        }
    };

    const deleteTrade = async (tradeId) => {
        if (!userId) {
            console.error("User not authenticated");
            return;
        }
        const tradeDocPath = `/artifacts/${appId}/users/${userId}/trades/${tradeId}`;
        try {
            await deleteDoc(doc(db, tradeDocPath));
        } catch (error) {
            console.error("Error deleting trade:", error);
            throw error;
        }
    };

    return {
        trades,
        isLoading,
        addTrade,
        updateTrade,
        deleteTrade
    };
};
