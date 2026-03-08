import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecondaryAd = () => {
    const navigate = useNavigate();
    const [currentCar, setCurrentCar] = useState(0);

    const showcaseImages = [
        {
            url: "/showroom_luxury_cars_1772994978117.webp",
            text: "Showroom Premium",
            sub: "Sélection Internationale"
        },
        {
            url: "/car_transport_trailer_1772995047462.webp",
            text: "Logistique Pro",
            sub: "Transport Sécurisé"
        },
        {
            url: "/port_containers_cars_1772995097646.webp",
            text: "Import/Export",
            sub: "Transit International"
        },
        {
            url: "/car_delivery_van_1772994995422.webp",
            text: "Livraison Premium",
            sub: "Service Clé en Main"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentCar((prev) => (prev + 1) % showcaseImages.length);
        }, 4500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 group cursor-pointer relative h-[500px]"
            onClick={() => navigate('/catalogue')}
        >
            {/* Slider Images */}
            {showcaseImages.map((car, index) => (
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
                {showcaseImages.map((car, index) => (
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
                {showcaseImages.map((_, index) => (
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
