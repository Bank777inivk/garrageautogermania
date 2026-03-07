import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';

// Fallback brands (used if Firestore is empty)
export const DEFAULT_BRANDS = [
    { name: 'Abarth', image: null },
    { name: 'Alfa Romeo', image: null },
    { name: 'Aston Martin', image: null },
    { name: 'Audi', image: null },
    { name: 'Bentley', image: null },
    { name: 'BMW', image: null },
    { name: 'Cadillac', image: null },
    { name: 'Chevrolet', image: null },
    { name: 'Chrysler', image: null },
    { name: 'Citroën', image: null },
    { name: 'Cupra', image: null },
    { name: 'Dacia', image: null },
    { name: 'Dodge', image: null },
    { name: 'DS Automobiles', image: null },
    { name: 'Ferrari', image: null },
    { name: 'Fiat', image: null },
    { name: 'Ford', image: null },
    { name: 'Honda', image: null },
    { name: 'Hyundai', image: null },
    { name: 'Infiniti', image: null },
    { name: 'Jaguar', image: null },
    { name: 'Jeep', image: null },
    { name: 'Kia', image: null },
    { name: 'Lamborghini', image: null },
    { name: 'Lancia', image: null },
    { name: 'Land Rover', image: null },
    { name: 'Lexus', image: null },
    { name: 'Lotus', image: null },
    { name: 'Maserati', image: null },
    { name: 'Mazda', image: null },
    { name: 'McLaren', image: null },
    { name: 'Mercedes-Benz', image: null },
    { name: 'MG', image: null },
    { name: 'Mini', image: null },
    { name: 'Mitsubishi', image: null },
    { name: 'Nissan', image: null },
    { name: 'Opel', image: null },
    { name: 'Peugeot', image: null },
    { name: 'Polestar', image: null },
    { name: 'Porsche', image: null },
    { name: 'Renault', image: null },
    { name: 'Rolls-Royce', image: null },
    { name: 'Seat', image: null },
    { name: 'Skoda', image: null },
    { name: 'Smart', image: null },
    { name: 'SsangYong', image: null },
    { name: 'Subaru', image: null },
    { name: 'Suzuki', image: null },
    { name: 'Tesla', image: null },
    { name: 'Toyota', image: null },
    { name: 'Volkswagen', image: null },
    { name: 'Volvo', image: null },
];

/**
 * useBrands — reads brands from Firestore 'categories' collection in real-time.
 * Falls back to DEFAULT_BRANDS if the collection is empty.
 * Returns: { brands: [{name, image}], loading }
 */
const useBrands = () => {
    const [brands, setBrands] = useState(DEFAULT_BRANDS);
    const [brandCounts, setBrandCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
        const unsubCategories = onSnapshot(q, (snap) => {
            if (snap.empty) {
                setBrands(DEFAULT_BRANDS);
            } else {
                const firestoreBrands = snap.docs.map(d => ({
                    id: d.id,
                    name: d.data().name,
                    image: d.data().image || null,
                    deleted: d.data().deleted || false,
                }));
                const activeFirestoreBrands = firestoreBrands.filter(b => !b.deleted);
                const firestoreNames = firestoreBrands.map(b => b.name);
                const extras = DEFAULT_BRANDS.filter(b => !firestoreNames.includes(b.name));
                setBrands([...activeFirestoreBrands, ...extras].sort((a, b) => a.name.localeCompare(b.name)));
            }
            setLoading(false);
        }, () => {
            setBrands(DEFAULT_BRANDS);
            setLoading(false);
        });

        const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snap) => {
            const counts = {};
            snap.docs.forEach(doc => {
                const data = doc.data();
                if (data.status === 'available' || data.status === undefined) {
                    const b = data.brand || 'Sans marque';
                    counts[b] = (counts[b] || 0) + 1;
                }
            });
            setBrandCounts(counts);
        }, () => {
            setBrandCounts({});
        });

        return () => {
            unsubCategories();
            unsubVehicles();
        };
    }, []);

    return { brands, loading, brandCounts };
};

export default useBrands;
