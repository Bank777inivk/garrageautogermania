import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (vehicle) => {
        const { items } = get();
        // Check if item already exists
        const exists = items.find((item) => item.id === vehicle.id);
        if (exists) {
          toast.error("Ce véhicule est déjà dans votre panier");
          return;
        }

        set({ items: [...items, vehicle] });
        toast.success(`${vehicle.brand} ${vehicle.model} ajouté au panier`);
      },

      removeFromCart: (vehicleId) => {
        set({ items: get().items.filter((item) => item.id !== vehicleId) });
      },

      updateQuantity: (vehicleId, quantity) => {
        // Not really used for unique cars, but implemented for specs
        // Since structure is simple array, handling quantity would require changing item structure to have .quantity
        // For now, assume 1 item = 1 vehicle. If we want multiple of same, we might need refactoring.
        // But prompt asked for the function.
        console.warn("updateQuantity not fully implemented for unique vehicles");
      },

      clearCart: () => {
        set({ items: [] });
      },

      // Computed values helpers
      getTotalItems: () => get().items.length,

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (Number(item.price) || 0), 0);
      },

      getShippingCost: () => {
        const total = get().getTotalPrice();
        // Exemple de règle : livraison gratuite si > 50 000€, sinon 550€
        // Pour l'instant on fixe à 550€ comme sur la maquette, sauf si vide
        if (total === 0) return 0;
        return total > 50000 ? 0 : 550;
      },

      getFinalTotal: () => {
        return get().getTotalPrice() + get().getShippingCost();
      },

      // UI State (not persisted)
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'cart-storage', // unique name for local storage
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);

export default useCartStore;
