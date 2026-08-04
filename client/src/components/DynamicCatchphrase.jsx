import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DynamicCatchphrase = () => {
    const { t } = useTranslation(['home', 'common']);
    const phrases = t('home:catchphrases', { returnObjects: true });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % phrases.length);
                setIsVisible(true);
            }, 1000); // Wait for exit animation
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, [phrases.length]);

    return (
        <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none overflow-hidden h-32">
            <div
                className={`transition-all duration-1000 ease-out transform ${isVisible
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-12 opacity-0'
                    }`}
            >
                <div className="bg-red-700/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-2xl border border-white/10 inline-block">
                    <p className="text-white font-black text-xs sm:text-sm uppercase tracking-[0.15em] leading-tight">
                        {phrases[currentIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DynamicCatchphrase;
