import { create } from 'zustand';
import { db } from '../firebase/config';
import { collection, onSnapshot, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';

let vehiclesUnsubscribe = null;
let featuredUnsubscribe = null;

const useClientVehicleStore = create((set, get) => ({
  featuredVehicles: [],
  vehicles: [],
  currentVehicle: null,
  favoriteVehicles: [],
  loading: false,
  error: null,

  fetchVehiclesByIds: async (ids) => {
    if (!ids || ids.length === 0) {
      set({ favoriteVehicles: [], loading: false });
      return;
    }
    set({ loading: true, error: null });
    try {
      // Use 'in' operator for efficient fetching (max 30 ids in one query usually)
      // If ids > 30, we'd need to chunk, but for favorites 30 is a reasonable limit
      const q = query(collection(db, 'vehicles'), where('__name__', 'in', ids.slice(0, 30)));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ favoriteVehicles: vehicles, loading: false });
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching favorites by IDs:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchVehicleById: async (id) => {
    set({ loading: true, error: null, currentVehicle: null });
    try {
      const docRef = doc(db, 'vehicles', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ currentVehicle: { id: docSnap.id, ...docSnap.data() }, loading: false });
      } else {
        set({ error: "Véhicule non trouvé", loading: false });
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchFeaturedVehicles: () => {
    // Only set loading if we don't have vehicles yet to avoid flickering during real-time updates
    if (get().featuredVehicles.length === 0) {
      set({ loading: true, error: null });
    }

    if (featuredUnsubscribe) featuredUnsubscribe();

    try {
      const q = query(
        collection(db, 'vehicles'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6)
      );

      featuredUnsubscribe = onSnapshot(q, (snapshot) => {
        const vehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ featuredVehicles: vehicles, loading: false });
      }, (err) => {
        console.error("Error fetching featured vehicles:", err);
        // Special case: missing index error usually provides a link in console
        if (err.code === 'failed-precondition') {
          set({ error: "Index Firestore manquant. Vérifiez la console pour le lien de création.", loading: false });
        } else {
          set({ error: err.message, loading: false });
        }
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchVehicles: (filters = {}) => {
    if (vehiclesUnsubscribe) vehiclesUnsubscribe();
    set({ loading: true, error: null });

    try {
      let vehiclesRef = collection(db, 'vehicles');
      let q = query(vehiclesRef);
      const constraints = [];

      if (filters.brand && filters.brand !== 'all') constraints.push(where('brand', '==', filters.brand));
      if (filters.fuel && filters.fuel !== 'all') constraints.push(where('fuel', '==', filters.fuel));
      if (filters.transmission && filters.transmission !== 'all') constraints.push(where('transmission', '==', filters.transmission));

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      } else {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      vehiclesUnsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedVehicles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering logic
        const filteredVehicles = fetchedVehicles.filter(vehicle => {
          let isValid = true;
          if (filters.model && !vehicle.model?.toLowerCase().includes(filters.model.toLowerCase())) isValid = false;
          if (filters.version && !vehicle.version?.toLowerCase().includes(filters.version.toLowerCase())) isValid = false;
          if (filters.minPrice && vehicle.price < Number(filters.minPrice)) isValid = false;
          if (filters.maxPrice && vehicle.price > Number(filters.maxPrice)) isValid = false;
          if (filters.minYear && vehicle.year < Number(filters.minYear)) isValid = false;
          if (filters.maxYear && vehicle.year > Number(filters.maxYear)) isValid = false;
          if (filters.minMileage && vehicle.mileage < Number(filters.minMileage)) isValid = false;
          if (filters.maxMileage && vehicle.mileage > Number(filters.maxMileage)) isValid = false;
          if (filters.minPower && vehicle.power < Number(filters.minPower)) isValid = false;
          if (filters.maxPower && vehicle.power > Number(filters.maxPower)) isValid = false;
          if (filters.type && filters.type !== 'all' && vehicle.type !== filters.type) isValid = false;
          if (filters.color && filters.color !== 'all' && vehicle.color !== filters.color) isValid = false;
          if (filters.ac && filters.ac !== 'all' && vehicle.ac !== filters.ac) isValid = false;
          if (filters.features && filters.features.length > 0) {
            const vehicleFeatures = vehicle.features || [];
            const missingFeature = filters.features.find(f => !vehicleFeatures.includes(f));
            if (missingFeature) isValid = false;
          }
          return isValid;
        });

        // Priority sorting: Featured first, then by createdAt
        const prioritizedVehicles = [...filteredVehicles].sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          // Sub-sort by date if both have same featured status
          const dateA = a.createdAt ? new Date(a.createdAt) : 0;
          const dateB = b.createdAt ? new Date(b.createdAt) : 0;
          return dateB - dateA;
        });

        set({ vehicles: prioritizedVehicles, loading: false });
      }, (err) => {
        console.error("Error fetching vehicles:", err);
        set({ error: err.message, loading: false });
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useClientVehicleStore;
