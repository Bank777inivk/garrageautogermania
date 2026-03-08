import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../firebase/config';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';

const useFavoriteStore = create(
    persist(
        (set, get) => ({
            favorites: [],

            toggleFavorite: async (vehicleId, userId = null) => {
                const { favorites } = get();
                const isFavorited = favorites.includes(vehicleId);

                // Update local state first for speed
                if (isFavorited) {
                    set({ favorites: favorites.filter((id) => id !== vehicleId) });
                } else {
                    set({ favorites: [...favorites, vehicleId] });
                }

                // 1. Sync global analytics (favoritesCount on vehicle)
                try {
                    const vehicleRef = doc(db, 'vehicles', vehicleId);
                    await updateDoc(vehicleRef, {
                        favoritesCount: increment(isFavorited ? -1 : 1)
                    });
                } catch (err) {
                    console.error("Failed to sync global favorites count:", err);
                }

                // 2. Sync with User Profile if logged in
                if (userId) {
                    try {
                        const userRef = doc(db, 'clients', userId);
                        await updateDoc(userRef, {
                            favorites: isFavorited ? arrayRemove(vehicleId) : arrayUnion(vehicleId)
                        });
                    } catch (err) {
                        console.error("Failed to sync user favorites:", err);
                    }
                }
            },

            // Merge local favorites to Firestore when user logs in
            syncWithUser: async (userId) => {
                const { favorites } = get();
                if (favorites.length === 0) return;

                try {
                    const userRef = doc(db, 'clients', userId);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const remoteFavorites = userData.favorites || [];

                        // Merge logic: combine local and remote, ensuring uniqueness
                        const mergedFavorites = Array.from(new Set([...remoteFavorites, ...favorites]));

                        await updateDoc(userRef, { favorites: mergedFavorites });
                        set({ favorites: mergedFavorites });
                    } else {
                        // Create profile with current local favorites if it doesn't exist
                        await setDoc(userRef, { favorites: favorites }, { merge: true });
                    }
                } catch (err) {
                    console.error("Error during favorite sync:", err);
                }
            },

            isFavorite: (vehicleId) => {
                return get().favorites.includes(vehicleId);
            },
        }),
        {
            name: 'garrage-favorites',
        }
    )
);

export default useFavoriteStore;
