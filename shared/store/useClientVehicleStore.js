import { create } from 'zustand';
import { db } from '../firebase/config';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';

const useClientVehicleStore = create((set) => ({
  featuredVehicles: [],
  vehicles: [], // Liste complète pour le catalogue
  currentVehicle: null, // Détail d'un véhicule
  loading: false,
  error: null,

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

  fetchFeaturedVehicles: async () => {
    set({ loading: true, error: null });
    try {
      // Récupérer les véhicules mis en avant (featured: true)
      // Ou à défaut les 6 derniers ajoutés si pas de featured
      let q = query(
        collection(db, 'vehicles'),
        where('featured', '==', true),
        limit(6)
      );

      let querySnapshot = await getDocs(q);

      // Si pas assez de véhicules mis en avant, on prend les derniers ajoutés
      if (querySnapshot.empty) {
        q = query(
          collection(db, 'vehicles'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        querySnapshot = await getDocs(q);
      }

      const vehicles = [];
      querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() });
      });
      set({ featuredVehicles: vehicles, loading: false });
    } catch (error) {
      console.error("Error fetching featured vehicles:", error);
      set({ error: error.message, loading: false });
    }
  },

  // Nouvelle fonction pour le catalogue avec filtres basiques
  fetchVehicles: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      let vehiclesRef = collection(db, 'vehicles');
      let q = query(vehiclesRef); // Start with a basic query

      const constraints = [];

      if (filters.brand && filters.brand !== 'all') {
        constraints.push(where('brand', '==', filters.brand));
      }

      if (filters.fuel && filters.fuel !== 'all') {
        constraints.push(where('fuel', '==', filters.fuel));
      }

      if (filters.transmission && filters.transmission !== 'all') {
        constraints.push(where('transmission', '==', filters.transmission));
      }

      // Apply filtering constraints
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      } else {
        // Default sort if no filters (or simple query)
        q = query(q, orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const vehicles = [];
      querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() });
      });

      // Client-side filtering for complex properties and ranges
      const filteredVehicles = vehicles.filter(vehicle => {
        let isValid = true;

        // Brand, Fuel, Transmission (equality filters)
        if (filters.brand && filters.brand !== 'all' && vehicle.brand !== filters.brand) isValid = false;
        if (filters.fuel && filters.fuel !== 'all' && vehicle.fuel !== filters.fuel) isValid = false;
        if (filters.transmission && filters.transmission !== 'all' && vehicle.transmission !== filters.transmission) isValid = false;

        // Model & Version (string search)
        if (filters.model && !vehicle.model?.toLowerCase().includes(filters.model.toLowerCase())) isValid = false;
        if (filters.version && !vehicle.version?.toLowerCase().includes(filters.version.toLowerCase())) isValid = false;

        // Ranges
        if (filters.minPrice && vehicle.price < Number(filters.minPrice)) isValid = false;
        if (filters.maxPrice && vehicle.price > Number(filters.maxPrice)) isValid = false;
        if (filters.minYear && vehicle.year < Number(filters.minYear)) isValid = false;
        if (filters.maxYear && vehicle.year > Number(filters.maxYear)) isValid = false;
        if (filters.minMileage && vehicle.mileage < Number(filters.minMileage)) isValid = false;
        if (filters.maxMileage && vehicle.mileage > Number(filters.maxMileage)) isValid = false;
        if (filters.minPower && vehicle.power < Number(filters.minPower)) isValid = false;
        if (filters.maxPower && vehicle.power > Number(filters.maxPower)) isValid = false;

        // Type, Color, AC
        if (filters.type && filters.type !== 'all' && vehicle.type !== filters.type) isValid = false;
        if (filters.color && filters.color !== 'all' && vehicle.color !== filters.color) isValid = false;
        if (filters.ac && filters.ac !== 'all' && vehicle.ac !== filters.ac) isValid = false;

        // Features (Array intersection) - if a filter is checked, vehicle MUST have it
        if (filters.features && filters.features.length > 0) {
          const vehicleFeatures = vehicle.features || [];
          const missingFeature = filters.features.find(f => !vehicleFeatures.includes(f));
          if (missingFeature) isValid = false;
        }

        return isValid;
      });

      set({ vehicles: filteredVehicles, loading: false });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      set({ error: error.message, loading: false });
    }
  },


}));

export default useClientVehicleStore;
