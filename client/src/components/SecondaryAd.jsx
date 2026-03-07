import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecondaryAd = () => {
    const navigate = useNavigate();
    const [currentCar, setCurrentCar] = useState(0);

    const ruggedCars = [
        {
            url: "https://images.unsplash.com/photo-1594976612710-664448507017?q=80&w=1200&auto=format&fit=crop",
            text: "Toyota Land Cruiser J79",
            sub: "L'Indestructible"
        },
        {
            url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1200&auto=format&fit=crop",
            text: "Land Rover Defender 110",
            sub: "L'Esprit d'Aventure"
        },
        {
            url: "https://images.unsplash.com/photo-1520031444948-4ce50c93a228?q=80&w=1200&auto=format&fit=crop",
            text: "Mercedes-Benz Classe G",
            sub: "Icône Tout-Terrain"
        },
        {
            url: "https://images.unsplash.com/photo-1603383928972-2116518cd3f3?q=80&w=1200&auto=format&fit=crop",
            text: "Toyota Hilux Expedition",
            sub: "Prêt pour l'Extrême"
        },
        {
            url: "https://images.unsplash.com/photo-1618353386007-920f2694b288?q=80&w=1200&auto=format&fit=crop",
            text: "Ford Bronco Wildtrak",
            sub: "Liberté Sans Limite"
        },
        {
            url: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?q=80&w=1200&auto=format&fit=crop",
            text: "Jeep Wrangler Rubicon",
            sub: "Pure Légende"
        },
        {
            url: "https://images.unsplash.com/photo-1582234052327-0bb1092e079f?q=80&w=1200&auto=format&fit=crop",
            text: "Nissan Patrol Y61",
            sub: "Le Roi du Désert"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentCar((prev) => (prev + 1) % ruggedCars.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 group cursor-pointer relative h-[500px]"
            onClick={() => navigate('/catalogue')}
        >
            {/* Slider Images */}
            {ruggedCars.map((car, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentCar ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                        }`}
                >
                    <img
                        src={car.url}
                        alt={car.text}
                        className="w-full h-full object-cover transform transition-transform duration-[4500ms] ease-linear group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                </div>
            ))}

            {/* Dynamic Text Content */}
            <div className="absolute bottom-8 left-6 right-6 z-10">
                {ruggedCars.map((car, index) => (
                    <div
                        key={index}
                        className={`transition-all duration-700 delay-300 ${index === currentCar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0'
                            }`}
                    >
                        <h4 className="text-white font-black text-xl uppercase tracking-tight leading-tight mb-2">
                            {car.text}
                        </h4>
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            {car.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Pagination Indicators */}
            <div className="absolute top-6 left-6 flex gap-2 z-20">
                {ruggedCars.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${index === currentCar ? 'w-6 bg-red-700' : 'w-2 bg-white/30'
                            }`}
                    ></div>
                ))}
            </div>

            {/* Hover Decor */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-700/20 transition-all duration-500 rounded-2xl pointer-events-none"></div>
        </div>
    );
};

export default SecondaryAd;
