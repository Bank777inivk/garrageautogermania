import { create } from 'zustand';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const useVehicleStore = create((set) => ({
  vehicles: [],
  loading: false,
  error: null,

  fetchVehicles: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const vehiclesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      set({ vehicles: vehiclesData, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addVehicle: async (vehicleData) => {
    set({ loading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicleData,
        createdAt: new Date().toISOString()
      });
      set((state) => ({
        vehicles: [...state.vehicles, { id: docRef.id, ...vehicleData }],
        loading: false
      }));
      return docRef.id;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateVehicle: async (id, updatedData) => {
    set({ loading: true, error: null });
    try {
      const vehicleRef = doc(db, 'vehicles', id);
      await updateDoc(vehicleRef, updatedData);
      set((state) => ({
        vehicles: state.vehicles.map(v => 
          v.id === id ? { ...v, ...updatedData } : v
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      set((state) => ({
        vehicles: state.vehicles.filter(v => v.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useVehicleStore;
