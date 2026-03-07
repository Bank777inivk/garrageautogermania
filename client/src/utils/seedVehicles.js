import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../shared/firebase/config';

const dummyVehicles = [
  {
    brand: 'Audi',
    model: 'RS6',
    version: 'Avant Performance',
    year: 2023,
    price: 145000,
    mileage: 12500,
    fuel: 'Essence',
    transmission: 'Automatique',
    power: 630,
    images: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop'],
    description: 'Véhicule de prestige avec un moteur V8 biturbo surpuissant. Confort exceptionnel et technologie de pointe. État impeccable, carnet d\'entretien complet.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  },
  {
    brand: 'Mercedes-Benz',
    model: 'G63',
    version: 'AMG',
    year: 2022,
    price: 189000,
    mileage: 25000,
    fuel: 'Essence',
    transmission: 'Automatique',
    power: 585,
    images: ['https://images.unsplash.com/photo-1605218427368-35b019b8e390?q=80&w=1000&auto=format&fit=crop'],
    description: 'L\'icône du tout-terrain de luxe. Performances hors normes et présence inégalée sur la route. Finition AMG exclusive.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  },
  {
    brand: 'Porsche',
    model: '911',
    version: 'GT3 RS',
    year: 2024,
    price: 285000,
    mileage: 1500,
    fuel: 'Essence',
    transmission: 'Automatique',
    power: 525,
    images: ['https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=1000&auto=format&fit=crop'],
    description: 'La référence absolue sur circuit, homologuée pour la route. Aérodynamisme actif et moteur atmosphérique de légende.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  },
  {
    brand: 'BMW',
    model: 'M4',
    version: 'Competition',
    year: 2023,
    price: 98000,
    mileage: 8500,
    fuel: 'Essence',
    transmission: 'Automatique',
    power: 510,
    images: ['https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop'],
    description: 'Agilité et puissance brute. Un coupé sportif parfait pour le quotidien et les sorties sur circuit. Échappement sport M.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  },
  {
    brand: 'Land Rover',
    model: 'Range Rover',
    version: 'Autobiography',
    year: 2023,
    price: 155000,
    mileage: 10000,
    fuel: 'Hybride',
    transmission: 'Automatique',
    power: 440,
    images: ['https://images.unsplash.com/photo-1519245659634-546d1a334d85?q=80&w=1000&auto=format&fit=crop'],
    description: 'Le summum du luxe et de la polyvalence. Intérieur sur mesure et capacités tout-terrain légendaires. Hybride performant.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  },
  {
    brand: 'Tesla',
    model: 'Model S',
    version: 'Plaid',
    year: 2023,
    price: 105000,
    mileage: 5000,
    fuel: 'Électrique',
    transmission: 'Automatique',
    power: 1020,
    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop'],
    description: 'Accélérations foudroyantes et autonomie record. Le futur de l\'automobile électrique avec une technologie de pointe.',
    featured: true,
    status: 'available',
    createdAt: Timestamp.now()
  }
];

export const seedVehicles = async () => {
  try {
    const promises = dummyVehicles.map(vehicle => addDoc(collection(db, 'vehicles'), vehicle));
    await Promise.all(promises);
    console.log('Vehicles seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    return false;
  }
};
