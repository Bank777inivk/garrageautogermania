import React, { useState, useEffect } from 'react';

const ScrollingTicker = () => {
    const phrases = [
        "L'Excellence Allemande à votre portée : importez votre véhicule premium directement d'Allemagne au meilleur prix du marché",
        "Importation directe : Économisez jusqu'à 25% sur votre prochain achat grâce à notre réseau exclusif de partenaires certifiés",
        "Garantie Premium incluse sur tous nos véhicules : roulez en toute sérénité avec notre couverture européenne complète",
        "Livraison sécurisée partout en France : nous transportons votre voiture de rêve jusqu'au pas de votre porte en un temps record",
        "Plus de 5000 véhicules disponibles dans notre catalogue : explorez une sélection unique de modèles rares et configurés sur mesure",
        "Service d'immatriculation express et clé en main : nous nous occupons de toutes les démarches administratives pour vous",
        "Expertise technique rigoureuse avant chaque vente : 150 points de contrôle effectués par nos mécaniciens spécialisés",
        "Financement flexible adapté à votre budget : des solutions de crédit et de LOA sur mesure pour concrétiser votre projet",
        "Reprise de votre ancien véhicule au meilleur prix : obtenez une offre d'achat immédiate et simplifiez votre transaction",
        "Garrage Pro : Votre partenaire confiance depuis 10 ans avec plus de 2000 clients satisfaits à travers toute l'Europe"
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState('opacity-100 translate-y-0');

    useEffect(() => {
        const interval = setInterval(() => {
            // Start fade out
            setFade('opacity-0 -translate-y-2');

            setTimeout(() => {
                // Change text and fade in
                setCurrentIndex((prev) => (prev + 1) % phrases.length);
                setFade('opacity-100 translate-y-0');
            }, 800); // Wait for fade out to complete

        }, 10000); // 10 seconds interval

        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <div className="hidden lg:flex flex-1 justify-center items-center h-full overflow-hidden px-4">
            <div className={`transition-all duration-1000 ease-in-out transform ${fade}`}>
                <p className="text-white font-bold text-[10px] tracking-wide text-center leading-none">
                    <span className="text-amber-500 mr-2 text-xs">✦</span>
                    {phrases[currentIndex]}
                    <span className="text-amber-500 ml-2 text-xs">✦</span>
                </p>
            </div>
        </div>
    );
};

export default ScrollingTicker;
