import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X, Check } from 'lucide-react';

/**
 * BrandSelect — Custom brand picker with logo thumbnails.
 * Works with any list of { name, image } brand objects.
 *
 * Props:
 *   brands      { name, image }[]   — brand list (from useBrands)
 *   value       string              — selected brand name ('' = all)
 *   onChange    (name: string) => void
 *   placeholder string              — default label
 *   allLabel    string              — label for the "all" option
 *   className   string              — extra wrapper CSS
 *   vehicleCounts {[name]: number} — optional count per brand
 */
const BrandSelect = ({
    brands = [],
    value = '',
    onChange,
    placeholder = 'Filtrer par marque...',
    allLabel = 'Toutes les marques',
    className = '',
    activeClassName = 'bg-[#2271B1] text-white border-[#2271B1]',
    vehicleCounts = {},
    compact = false,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [coords, setCoords] = useState(null);
    const ref = useRef(null);
    const dropdownRef = useRef(null);

    // Close on outside click or scroll to prevent misalignment
    useEffect(() => {
        if (!open) return;

        const updateCoords = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom - 16;
                const spaceAbove = rect.top - 16;
                const searchHeight = 55;
                const idealListHeight = 288;

                if (spaceBelow < (idealListHeight + searchHeight) && spaceAbove > spaceBelow) {
                    // Not enough space below, open upwards
                    setCoords({
                        bottom: window.innerHeight - rect.top + 4,
                        left: rect.left,
                        width: Math.max(rect.width, 288),
                        maxListHeight: Math.min(spaceAbove - searchHeight, idealListHeight)
                    });
                } else {
                    // Open downwards
                    setCoords({
                        top: rect.bottom + 4,
                        left: rect.left,
                        width: Math.max(rect.width, 288),
                        maxListHeight: Math.min(spaceBelow - searchHeight, idealListHeight)
                    });
                }
            }
        };

        const handleOutsideClick = (e) => {
            if (ref.current && !ref.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        const handleScroll = (e) => {
            // Only close if scrolling outside the dropdown itself
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        updateCoords();
        window.addEventListener('resize', updateCoords);
        document.addEventListener('mousedown', handleOutsideClick);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);

    const selectedBrand = brands.find(b => b.name === value);

    const filtered = brands.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (name) => {
        onChange(name);
        setOpen(false);
        setSearch('');
    };

    return (
        <div ref={ref} className={`relative select-none ${className}`}>
            {/* Trigger Button */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(!open)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpen(!open);
                    }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-bold transition-all outline-none cursor-pointer ${value
                    ? activeClassName
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
            >
                {/* Logo thumbnail */}
                {selectedBrand?.image ? (
                    <img
                        src={selectedBrand.image}
                        alt={selectedBrand.name}
                        className="w-6 h-6 object-contain rounded flex-shrink-0 bg-white p-0.5"
                    />
                ) : (
                    <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-black ${value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {value ? value.substring(0, 2).toUpperCase() : '🏷️'}
                    </div>
                )}

                <span className="flex-1 text-left truncate">
                    {value || placeholder}
                </span>

                {value ? (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelect(''); }}
                        className="p-0.5 rounded hover:bg-white/20 transition-colors"
                    >
                        <X size={14} />
                    </button>
                ) : (
                    <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                )}
            </div>

            {/* Dropdown Panel - via Portal to escape overflow-hidden containers */}
            {open && coords && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        top: coords.top !== undefined ? coords.top : 'auto',
                        bottom: coords.bottom !== undefined ? coords.bottom : 'auto',
                        left: coords.left,
                        width: coords.width,
                        zIndex: 99999
                    }}
                    className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 flex-shrink-0">
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                autoFocus
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#2271B1]/30 focus:border-[#2271B1] bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div
                        className="overflow-y-auto overscroll-contain"
                        style={{ maxHeight: coords.maxListHeight || 288 }}
                    >
                        {/* "All" option */}
                        {!search && (
                            <button
                                type="button"
                                onClick={() => handleSelect('')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left ${!value ? 'bg-blue-50' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg">🏷️</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 flex-1">{allLabel}</span>
                                {!value && <Check size={16} className="text-[#2271B1] flex-shrink-0" />}
                            </button>
                        )}

                        {filtered.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-6 italic">Aucun résultat</p>
                        )}

                        {filtered.map(brand => {
                            const count = vehicleCounts[brand.name] ?? null;
                            const isSelected = value === brand.name;
                            return (
                                <button
                                    key={brand.name}
                                    type="button"
                                    onClick={() => handleSelect(brand.name)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left ${isSelected ? 'bg-blue-50' : ''}`}
                                >
                                    {/* Logo */}
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {brand.image ? (
                                            <img src={brand.image} alt={brand.name} className="w-full h-full object-contain p-0.5" />
                                        ) : (
                                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                                {brand.name.substring(0, 2)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <span className={`text-sm font-bold flex-1 ${isSelected ? 'text-[#2271B1]' : 'text-gray-700'}`}>
                                        {brand.name}
                                    </span>

                                    {/* Count badge */}
                                    {count !== null && (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${count > 0
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {count}
                                        </span>
                                    )}

                                    {isSelected && <Check size={14} className="text-[#2271B1] flex-shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BrandSelect;
