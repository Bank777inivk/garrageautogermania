import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const categories = [
  { name: 'Abarth', image: 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop', slug: 'Abarth' },
  { name: 'Alfa Romeo', image: 'https://images.unsplash.com/photo-1605218427368-35b019b8e390?q=80&w=1000&auto=format&fit=crop', slug: 'Alfa-Romeo' },
  { name: 'Aston Martin', image: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?q=80&w=1000&auto=format&fit=crop', slug: 'Aston-Martin' },
  { name: 'Audi', image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=1000&auto=format&fit=crop', slug: 'Audi' },
  { name: 'Bentley', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop', slug: 'Bentley' },
  { name: 'BMW', image: 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop', slug: 'BMW' },
  { name: 'Cadillac', image: 'https://images.unsplash.com/photo-1619477322301-52467d023349?q=80&w=1000&auto=format&fit=crop', slug: 'Cadillac' },
  { name: 'Chevrolet', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop', slug: 'Chevrolet' },
  { name: 'Chrysler', image: 'https://placehold.co/600x400?text=Chrysler', slug: 'Chrysler' },
  { name: 'Citroën', image: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=1000&auto=format&fit=crop', slug: 'Citroen' },
  { name: 'Cupra', image: 'https://images.unsplash.com/photo-1621257278272-46c4069777c9?q=80&w=1000&auto=format&fit=crop', slug: 'Cupra' },
  { name: 'Dacia', image: 'https://images.unsplash.com/photo-1621257278272-46c4069777c9?q=80&w=1000&auto=format&fit=crop', slug: 'Dacia' },
  { name: 'Dodge', image: 'https://images.unsplash.com/photo-1585011664466-b7cb99042767?q=80&w=1000&auto=format&fit=crop', slug: 'Dodge' },
  { name: 'DS Automobiles', image: 'https://images.unsplash.com/photo-1583267746897-2cf415887172?q=80&w=1000&auto=format&fit=crop', slug: 'DS-Automobiles' },
  { name: 'Ferrari', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1000&auto=format&fit=crop', slug: 'Ferrari' },
  { name: 'Fiat', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000&auto=format&fit=crop', slug: 'Fiat' },
  { name: 'Ford', image: 'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=1000&auto=format&fit=crop', slug: 'Ford' },
  { name: 'Honda', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Honda' },
  { name: 'Hyundai', image: 'https://images.unsplash.com/photo-1596767777799-7872c2c77d2d?q=80&w=1000&auto=format&fit=crop', slug: 'Hyundai' },
  { name: 'Infiniti', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Infiniti' },
  { name: 'Jaguar', image: 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop', slug: 'Jaguar' },
  { name: 'Jeep', image: 'https://images.unsplash.com/photo-1585011664466-b7cb99042767?q=80&w=1000&auto=format&fit=crop', slug: 'Jeep' },
  { name: 'Kia', image: 'https://images.unsplash.com/photo-1567818735868-e71b99e59e73?q=80&w=1000&auto=format&fit=crop', slug: 'Kia' },
  { name: 'Lamborghini', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop', slug: 'Lamborghini' },
  { name: 'Lancia', image: 'https://placehold.co/600x400?text=Lancia', slug: 'Lancia' },
  { name: 'Land Rover', image: 'https://images.unsplash.com/photo-1519245659634-546d1a334d85?q=80&w=1000&auto=format&fit=crop', slug: 'Land-Rover' },
  { name: 'Lexus', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Lexus' },
  { name: 'Lotus', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Lotus' },
  { name: 'Maserati', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Maserati' },
  { name: 'Mazda', image: 'https://images.unsplash.com/photo-1570280406792-bf58b7c59247?q=80&w=1000&auto=format&fit=crop', slug: 'Mazda' },
  { name: 'McLaren', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1000&auto=format&fit=crop', slug: 'McLaren' },
  { name: 'Mercedes-Benz', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop', slug: 'Mercedes-Benz' },
  { name: 'MG', image: 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop', slug: 'MG' },
  { name: 'Mini', image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1000&auto=format&fit=crop', slug: 'Mini' },
  { name: 'Mitsubishi', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Mitsubishi' },
  { name: 'Nissan', image: 'https://images.unsplash.com/photo-1567808291548-fc3ee04dbcf9?q=80&w=1000&auto=format&fit=crop', slug: 'Nissan' },
  { name: 'Opel', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop', slug: 'Opel' },
  { name: 'Peugeot', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop', slug: 'Peugeot' },
  { name: 'Polestar', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Polestar' },
  { name: 'Porsche', image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=1000&auto=format&fit=crop', slug: 'Porsche' },
  { name: 'Renault', image: 'https://images.unsplash.com/photo-1626357908871-7f32d886658d?q=80&w=1000&auto=format&fit=crop', slug: 'Renault' },
  { name: 'Rolls-Royce', image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1000&auto=format&fit=crop', slug: 'Rolls-Royce' },
  { name: 'Seat', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Seat' },
  { name: 'Skoda', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Skoda' },
  { name: 'Smart', image: 'https://placehold.co/600x400?text=Smart', slug: 'Smart' },
  { name: 'SsangYong', image: 'https://placehold.co/600x400?text=SsangYong', slug: 'SsangYong' },
  { name: 'Subaru', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Subaru' },
  { name: 'Suzuki', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Suzuki' },
  { name: 'Tesla', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1000&auto=format&fit=crop', slug: 'Tesla' },
  { name: 'Toyota', image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1000&auto=format&fit=crop', slug: 'Toyota' },
  { name: 'Volkswagen', image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1000&auto=format&fit=crop', slug: 'Volkswagen' },
  { name: 'Volvo', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1000&auto=format&fit=crop', slug: 'Volvo' }
];

export { categories }; // Export pour réutilisation

const CategoryGrid = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-montserrat text-gray-900 mb-4">
            {t('home.categoriesTitle', 'Parcourez par Marque')}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('home.categoriesSubtitle', 'Retrouvez les constructeurs allemands les plus prestigieux.')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/catalogue?brand=${cat.slug}`}
              className="group relative h-40 rounded-lg overflow-hidden cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${cat.image})` }}
              ></div>
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white font-bold text-lg tracking-wider uppercase">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
