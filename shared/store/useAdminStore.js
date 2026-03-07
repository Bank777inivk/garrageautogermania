import { create } from 'zustand';
import { db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const useAdminStore = create((set, get) => ({
  admins: [],
  loading: false,
  error: null,

  fetchAdmins: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'admins'));
      const admins = [];
      querySnapshot.forEach((doc) => {
        admins.push({ email: doc.id, ...doc.data() });
      });
      set({ admins, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addAdmin: async (email) => {
    set({ loading: true, error: null });
    try {
      // On utilise l'email comme ID pour éviter les doublons facilement
      await setDoc(doc(db, 'admins', email), {
        role: 'admin',
        createdAt: serverTimestamp()
      });
      // Rafraîchir la liste
      get().fetchAdmins();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  removeAdmin: async (email) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'admins', email));
      // Rafraîchir la liste
      get().fetchAdmins();
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useAdminStore;
