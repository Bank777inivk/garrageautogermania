import { db } from '../firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';
import { categories } from '../../client/src/components/CategoryGrid';

const seedCategories = async () => {
  console.log('Seeding categories...');
  
  try {
    for (const cat of categories) {
      // Utiliser le nom comme ID pour simplifier
      await setDoc(doc(db, 'categories', cat.name), {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        active: true,
        order: 0
      });
      console.log(`Category ${cat.name} added.`);
    }
    console.log('All categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

export default seedCategories;
